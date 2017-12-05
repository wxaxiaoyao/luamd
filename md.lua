local match=string.match

local md = {}

function log(...)
	obj = {...}
	out = out or print

	local outlist = {}
	function _print(obj, level, flag)
		-- 避免循环输出
		local obj_str = tostring(obj)
		for _, str in ipairs(outlist) do
			if str == obj_str then
				return
			end
		end
		outlist[#outlist+1] = obj_str

		level = level or 0
		local indent_str = ""
		for i = 1, level do
		  indent_str = indent_str.."    "
		end
	  
		if not flag then
			out(indent_str.."{")
		end
	  
		for k,v in pairs(obj) do
			if type(v) == "table" then 
				out(string.format("%s    %s = {", indent_str, tostring(k)))
				_print(v, level + 1, true)
			elseif type(v) == "string" then
				out(string.format('%s    %s = "%s"', indent_str, tostring(k), tostring(v)))
			else
				out(string.format("%s    %s = %s", indent_str, tostring(k), tostring(v)))
			end
		end
		out(indent_str.."}")
	end
	
	if type(obj) == "table" then
		_print(obj)
	elseif type(obj) == "string" then
		out('"' .. obj .. '"')
	else
		out(tostring(obj))
	end
end

-- 字符串分割
function string_split(str, sep)
	local list = {}

	if not (string.match(str, sep .. "$")) then
		str = str .. sep
	end

	for word in string.gmatch(str, '([^' .. sep .. ']*)' .. sep) do
		list[#list+1] = word
	end

	return list
end

function md:new_token(tag, content, text,  start_line, end_line)
	return {
		tag = tag,
		content = content,
		text = text,
		start_line = start_line,
		end_line = end_line,
	}
end

function md:init(text, option)
	text = string.gsub(text, '\r\n', '\n')
	
	self.delim = "\n"
	self.lines = string_split(text, '\n')
	self.current_line = 0

	-- token list
	self.tokens = {}
end

function md:get_current_line_no()
	return self.current_line
end

-- 获取当前行内容
function md:get_current_line() 
	return self.lines[self.current_line]
end

-- 获取下一行内容
function md:get_next_line()
	local line = self.lines[self.current_line+1]
	if is_next then
		self:next_line()
	end

	return line
end

-- 下一行
function md:next_line()
	self.current_line = self.current_line + 1
	return self.lines[self.current_line]
end

-- H1~H6 解析
function md:header_rule()
	local start_line_no = self:get_current_line_no()
	local line = self:get_current_line()
	local header_reg = '^(#+)(.*)'
	local hn, content = string.match(line, header_reg)
	
	if not hn then
		return 
	end

	local tag = "h" .. #hn
	if #hn > 6 then
		tag = "h6"
	end
	
	self.tokens[#self.tokens + 1] = {
		tag = tag,
		content = content,
		text = lines,
		start_line_no = start_line_no,
		end_line_no = start_line_no,
	}

	return
end

function md:is_empty_line(line)
	return string.match("^%s*$")
end


function md:get_keyword(line)
	if string.match(line, '^#+') then
		local hn = string.match(line, '^(#+)')
	end
		

	return string.match(line, '')	
end

function md:state()
	local line_begin, line, line_no, keyword, last_ch, ch, stack, top

	top = 1
	for line_no, line in ipairs(self.lines) do
		line_begin = true
		for i = 1, #line do
			ch = string.sub(line, i, i)
			if line_begin then
				if ch == "#" then
				end
			end
		end
	end
	line_no = self:get_current_line_no()
	line = self:next_line()

	if not line then
		return 
	end
end


function md:render(text, option)
	text = [[
## hello world
]]
	self:init(text, option)

	log(self.lines)
	--local line = self:next_line(true)
	--while line do
		--header_rule()
		--line = self:next_line(true)
	--end
end

md:render()
return md
