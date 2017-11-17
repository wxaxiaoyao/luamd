

local md = {}

-- 字符串分割
function string_split(str, sep)
	local list = {}

	for word in string.gmatch(str, '([^' .. sep .. ']+)') do
		list[#list+1] = word
	end

	return list
end


function md:init(text, option)
	text = string.sub(text, '\r\n', '\n')
	
	self.lines = string_split(text, '\n')
	self.current_line = 0
end

-- 获取当前行内容
function md:get_current_line() 
	return self.lines[self.current_line]
end

-- 获取下一行内容
function md:get_next_line()
	return self.lines[self.current_line+1]
end

-- 下一行
function md:next_line()
	self.current_line = self.current_line + 1
end

function header_rule()
end

function md:render(text, option)
	self:init(text, option)

	local line = self:get_next_line()
	while line do
	end
end

return md
