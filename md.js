
var md = {
	block_rule_list:[],
	inline_rule_list:[],
};

function link(text) {
	var reg_str = /\[^!][(.*?)\]\((.*?)\)/;
	var regs = (" " + text).match(reg_str);
		
	if (!regs) {
		return text;
	}	

	var match_str = regs[0];
	var link_text = regs[1];
	var link_href = regs[2];
	var link_str = '<a href="'+ link_href +'">' + link_text + '</a>';
	
	text = text.replace(reg_str, link_str)

	return link(text);
}
//function link_test() {
	//var text = "hello world[百度](http://www.baidu.com) this is test [1](1)";

	//console.log(link(text));
//}
//link_test();

function image(text) {
	var reg_str = /\![(.*?)\]\((.*?)\)/;
	var regs = text.match(reg_str);
		
	if (!regs) {
		return text;
	}	

	var match_str = regs[0];
	var image_text = regs[1];
	var image_href = regs[2];
	var image_str = '<img src="'+ image_href +'" alt="'+ image_text + '"/>';
	
	text = text.replace(reg_str, image_str)

	return image(text);
}

function em(text) {
	var reg_str = /\*(.*?)\*/;
	var regs = text.match(reg_str);
	var htmlstr = "";	
	if (regs){
		htmlstr = '<em>' + regs[1] + '</em>';
		text = text.replace(reg_str, htmlstr);
		return em(text);
	}

	reg_str = /-(.*?)-/;
	regs = text.match(reg_str);
	if (regs){
		htmlstr = '<em>' + regs[1] + '</em>';
		text = text.replace(reg_str, htmlstr);
		return em(text);
	}

	return text;
}

function strong(text) {
	var reg_str = /\*\*(.*?)\*\*/;
	var regs = text.match(reg_str);
	var htmlstr = "";	
	if (regs){
		htmlstr = '<strong>' + regs[1] + '</strong>';
		text = text.replace(reg_str, htmlstr);
		return strong(text);
	}

	reg_str = /--(.*?)--/;
	regs = text.match(reg_str);
	if (regs){
		htmlstr = '<strong>' + regs[1] + '</strong>';
		text = text.replace(reg_str, htmlstr);
		return strong(text);
	}

	return text;
}

function code(text) {
	var reg_str = /`(.*?)`/;
	var regs = text.match(reg_str);
	var htmlstr = "";	
	if (regs){
		htmlstr = '<code>' + regs[1] + '</code>';
		text = text.replace(reg_str, htmlstr);
		return strong(text);
	}

	return text;
}


// 是否是空行
function is_empty_list(line) {
	if (line.trim() == "") {
		return true;
	}
	return false;
}

function block_code(obj) {
	var cur_line = obj.lines[obj.start];
	var reg_str = /^```/;
	if (!cur_line.match(reg_str)) {
		return ;
	}
	var content = cur_line, i = 0;

	for (i = obj.start + 1; i < obj.lines.length; i++) {
		var line = obj.lines[i];
		content += "\n" + line;
		if (line.match(reg_str)) {
			break;
		}
	}

	return {
		tag:'pre',
		content:content,
		start: obj.start,
		end: i,
		htmlContent: '<pre>' + content + '</pre>',
	}
}

// 头部判断
function header(obj) {
	var cur_line = obj.lines[obj.start];

	var regs = cur_line.match(/^(#{1,6})(.*)/);

	if (!regs) {
		return;
	}

	var token = {
		tag:"h" + regs[1].length,
		content: regs[2],
		start: obj.start,
		end: obj.start,
	}

	token.htmlContent = obj.md.line_parse(token.content);
	return token;
}

// 换行
function br(obj) {
	var cur_line = obj.lines[obj.start];
	var i = 0, htmlContent = "";	
	if (!is_empty_list(cur_line)) {
		return;
	}

	for (i = obj.start + 1; i < obj.length; i++) {
		if (!is_empty_list(obj.lines[i])) {
			break;
		}
		htmlContent += "<br/>";
	}

	if (i == obj.start + 1) {
		return;
	}

	return {
		tag: "div",
		htmlContent: htmlContent,
		start: obj.start+1,
		end: i,
	}
}

// 段落
function paragraph(obj) {
	var is_paragraph_line = function(line) {
		var syntax_flag_list = ['#', '*', '+', '-', '>', '    ', '\t', '```'];
		for (var i = 0; i < syntax_flag_list.length; i++) {
			if (line.indexOf(syntax_flag_list[i]) == 0) {
				return false;
			}
		}

		if (line.match(/^\d+\./)) {
			return false;
		}
		return true;
	}

	var cur_line = obj.lines[obj.start];
	if (!is_paragraph_line(cur_line)) {
		return;
	}

	var content = cur_line, i = 0;
	for (i = obj.start+1; i < obj.lines.length; i++) {
		var line = obj.lines[i];
		if (!is_paragraph_line(line)) {
			break;
		}
		content += "<br/>" + line;
	}

	var token = {
		tag: "p",
		content: content,
		start: obj.start,
		end:i,
	}
	token.htmlContent = obj.md.line_parse(token.content);
	return token;
}

// 引用
function blockquote(obj) {
	var cur_line = obj.lines[obj.start];
	if (cur_line.indexOf(">") != 0) {
		return ;
	}
	
	var content = cur_line.substring(1), i = 0;
	for (i = obj.start + 1; i < obj.lines.length; i++) {
		var line = obj.lines[i];
		if (is_empty_list(line)) {
			break;
		}
		line = line.trim();
		content += "\n" + (line[0] == ">" ? line.substring(1) : line);
	}

	return {
		tag: "blockquote",
		content: content,
		start: obj.start,
		end: i,
		subtokens: md.block_parse(content),
	}
}

// 列表
function list(obj) {
	var cur_line = obj.lines[obj.start];
	var is_list = function(line) {
		if (line.indexOf("*.") == 0 || line.indexOf("-.") == 0 || line.indexOf("+.") == 0) {
			return {is_list: true, is_sort: false};
		}
		if (line.match(/^\d+\./)) {
			return {is_list:true, is_sort: true};
		}

		return {is_list:false, is_sort: false};
	}

	var cur_ret = is_list(cur_line);
	if (!cur_ret.is_list) {
		return;
	}

	var content = cur_line, i = 0;
	var subtokens = [];
	var token = {
		tag: "li",
		start: obj.start,
		content: cur_line.substring(2).trim(),
	}
	for (i = obj.start + 1; i < obj.lines.length; i++) {
		var line = obj.lines[i];
		var ret = is_list(line);
		if (is_empty_list(line)) {
			token.end = i;
			token.subtokens = md.block_parse(token.content);
			subtokens.push(token);
			break;
		}
		if (ret.is_list) {
			token.end = i;
			token.subtokens = md.block_parse(token.content);
			subtokens.push(token);
			if (cur_ret.is_sort != ret.is_sort) {
				break;
			} else {
				token = {
					tag: "li",
					start: i,
					content: line.substring(2).trim(),
				}
			}
		} else {
			token.content += "\n" + line.trim();
		}
		content += "\n" + line;
	}
	
	return {
		tag: (cur_line[0] == "*" || cur_line[0] == "+" || cur_line[0] == "-") ? "ul" : "ol",
		content: content,
		start: obj.start,
		end: i,
		subtokens: subtokens,
	} 
}	


// 分割线
function horizontal_line(obj) {
	var cur_line = obj.lines[obj.start];

	if (!cur_line.trim().match(/(\*{2,}|-{2,})/)) {
		return ;
	}

	return {
		tag: "div",
		htmlContent:"<hr>",
		content: cur_line,
		start: obj.start,
		end: obj.start+1,
	}
}

// 表
function table(obj) {

}

// 渲染token
function render_token(token) {
	var htmlContent = "";

	if (token.htmlContent) {
		return token.htmlContent;
	}

	htmlContent += "<" + token.tag + ">";

	var subtokens = token.subtokens || [];
	for (var i = 0; i < subtokens.length; i++) {
		htmlContent += render_token(subtokens[i]);
	}
	htmlContent += "</" + token.tag + ">";

	return htmlContent;
}

md.line_parse = function(text) {

}

md.register_inline_rule = function(rule) {
	self.inline_rule_list.push(rule);
}

md.register_block_rule = function(rule) {
	self.block_rule_list.push(rule);
}

md.block_parse = function(text) {
	var self = this;
	var params = {}, tokens = [], lines = text.split("\n"), start = 0;
		
	while(start < lines.length) {
		params.start = start;
		params.lines = lines;

		for (var i = 0; i < md.block_rule_list.length; i++){
			var block_rule = md.block_rule_list[i];
			var token = block_rule(params);
			if (token) {
				tokens.push(token);
				start = token.end - 1;
				break;
			}
		}
		start++;
	}	

	return tokens;
}

md.parse = function(text) {
	return self.block_parse(text);
}

md.render = function(text) {
	var tokens = this.parse(text);

	var htmlContent = "";
	for (var i = 0; i < tokens.length; i++) {
		htmlContent += render_token(tokens[i]);	
	}

	return htmlContent;
}

function test() {
	console.log("hello world")
}

//test();
