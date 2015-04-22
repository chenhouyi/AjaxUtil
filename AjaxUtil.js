/**
 * Ajax封装，执行基本Ajax请求
 * @version 0.1.1
 * @author Howie Chen
 */

var AjaxUtil = function(){

	/**
	 * 创建一个XMLHttpRequest对象
	 * @return {object} XMLHttpRequest对象
	 */
	function _createXHR() {
		// 检测原生XHR对象是否存在，如果存在，则返回它的新实例
		if (typeof XMLHttpRequest != 'undefined') {
			return new XMLHttpRequest();
		// 如果原生对象不存在，则检测ActiveX对象
		} else if (typeof ActiveXObject != 'undefined') {
			// 如果由ActiveX对象实现的XHR对象版本不确定，则依次尝试各个版本，版本号从高到低
			if (typeof arguments.callee.activeXString != 'string') {
				var versions = ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp'],
					i, len;
				for (i=0, len=versions.length; i<len; i++) {
					try {
						new ActiveXObject(versions[i]);
						arguments.callee.activeXString = versions[i];
						break;
					} catch (ex) {}
				}
			}
			return new ActiveXObject(arguments.callee.activeXString);
		// 如果以上两种对象都不存在，则抛出一个错误
		} else {
			throw new Error('No XHR object available.');
		}
	}

	/**
	 * 获取对象的属性名的集合
	 * @param  {object} obj 目标对象
	 * @return {array}      包含目标对象的属性名的数组
	 */
	function _getObjectProperties(obj) {
		var properties = [];
		for (var propName in obj) {
			if (obj.hasOwnProperty(propName)) {
				properties.push(propName);
			}
		}
		return properties;
	}

	/**
	 * 将查询字符串添加到URL
	 * 使用方法一
	 * @param  {string} arguments[0] URL(查询字符串可带可不带)
	 * @param  {object} arguments[1] 查询字符串的集合(对象的属性名和值分别是查询字符串的name和value)
	 * @return {string}              组装好查询字符串的URL
	 * 使用方法二
	 * @param  {string} arguments[0] URL(查询字符串可带可不带)
	 * @param  {string} arguments[1] 一组查询的name
	 * @param  {string} arguments[2] 一组查询的value
	 * @return {string}              组装好查询字符串的URL
	 * 使用方法三
	 * @param  {string} arguments[0] URL(查询字符串可带可不带)
	 * @param  {string} arguments[1] 查询字符串，如firstname=Howie&lastname=Chen
	 * @return {string}              组装好查询字符串的URL
	 */
	function _addURLParam() {
		var url = arguments[0];
		if (typeof url != 'string') {
			throw new Error('传入参数的类型不正确！');
		}
		if (arguments.length == 2) {
			var arg     = arguments[1],
				argType = typeof arg;
			switch (argType) {
				case 'object': {
					var params = arg;
					var propNames = _getObjectProperties(params),
						i, len;
					for (i=0, len=propNames.length; i<len; i++) {
						var name  = propNames[i],
							value = params[name];
						url = arguments.callee(url, name, value);
					}
					return url;
				}
				case 'string': {
					url += (url.indexOf('?') == -1 ? '?' : '&')
						 + encodeURIComponent(arg);
					return url;
				}
				default: {
					throw new Error('传入参数的类型不正确！');
				}
			}
		} else if (arguments.length == 3) {
			var name  = arguments[1],
				value = arguments[2];
			if (typeof name  != 'string' ||
					(typeof value != 'string' &&
					 typeof value != 'number' &&
					 typeof value != 'boolean')) {
				throw new Error('传入参数的类型不正确！');
			}
			url += (url.indexOf('?') == -1 ? '?' : '&')
				 + encodeURIComponent(name) + '=' + encodeURIComponent(value);
			return url;
		}
		throw new Error('传入参数的个数不正确！');
	}

	/**
	 * 为XMLHttpRequest对象绑定监听事件
	 * @param  {object}   xhr     XMLHttpRequest对象
	 * @param  {function} success 服务器成功返回结果时执行的回调函数
	 * @param  {function} failure 服务器返回结果失败时执行的回调函数
	 */
	function _onReadyStateChange(xhr, success, failure) {
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if ((xhr.state >= 200 && xhr.state < 300) || xhr.state == 304) {
					success(xhr);
				} else {
					failure(xhr);
				}
			}
		};
	}

	/**
	 * 发送Ajax请求
	 * @param  {string} url     服务器接口地址
	 * @param  {object} options 用于发送Ajax请求所需参数的集合
	 * ---- @prop   {boolean}        async     异步true(默认) OR 同步false
	 * ---- @prop   {object/string}  data      发送请求时附带的参数
	 * ---- @prop   {string}         method    请求发送的方式，GET(默认) OR POST
	 * ---- @prop   {function}       success   服务器成功返回结果时执行的回调函数
	 * ---- @prop   {function}       failure   服务器返回结果失败时执行的回调函数  
	 * @return {object}         XMLHttpRequest对象
	 */
	function sendRequest(url, options) {
		if (typeof url != 'string') {
			throw new Error('传入参数[url]的类型不正确，必须是{string}');
		}
		function fn(){}
		var async  = options.async !== false,
			data   = options.data || null,
			method = options.method || 'GET',
			success = options.success || fn,
			failure = options.failure || fn,
			method = method.toUpperCase();
		if (method == 'GET' && data) {
			url = _addURLParam(url, data);
			data = null;
		}
		var xhr = _createXHR();
		_onReadyStateChange(xhr, success, failure);
		xhr.open(method, url, async);
		if (method == 'POST') {
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;')
		}
		xhr.send(data);
		return xhr;
	}

	return {
		sendRequest: sendRequest
	};

}();