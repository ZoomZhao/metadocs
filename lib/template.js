/**
 * Template Module
 *
 * Adapted from OzJS's template module
 * https://github.com/dexteryy/OzJS/blob/master/mod/template.js
 */
var fs = require('fs'),
    _ = require('./lang'),
    tplSettings = {
        cache: {},
        evaluate: /\<%([\s\S]+?)%\>/g,
        interpolate: /\<%=([\s\S]+?)%\>/g
    },
    tplMethods = {
        substr: substr,
        include: tmpl
    };

function escapeHTML(str){
    str = str || '';
    var xmlchar = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
        '{': '&#123;',
        '}': '&#125;',
        '@': '&#64;'
    };
    return str.replace(/[&<>'"\{\}@]/g, function(match){
        return xmlchar[match];
    });
}

/**
 * @public 按字节长度截取字符串
 * @param {string} str是包含中英文的字符串
 * @param {int} limit是长度限制（按英文字符的长度计算）
 * @param {function} cb返回的字符串会被方法返回
 * @return {string} 返回截取后的字符串,默认末尾带有"..."
 */
function substr(str, limit, cb){
    if(!str || typeof str !== 'string')
        return '';
    var sub = str.substr(0, limit).replace(/([^\x00-\xff])/g, '$1 ')
        .substr(0, limit).replace(/([^\x00-\xff])\s/g, '$1');
    return cb ? cb.call(sub, sub) : (str.length > sub.length ? sub + '...' : sub);
}

function trueSize(str) {
    return str.replace(/([^\x00-\xff]|[A-Z])/g, '$1 ').length;
}

// From Underscore.js 
// JavaScript micro-templating, similar to John Resig's implementation.
function tmpl(str, data, tpl) {
    var c = tplSettings,
        i = _.extend({}, tplMethods, tpl), 
        tplbox, func,
        result = '';

    if (typeof str === 'string' && str.length === 0) {
        return result;
    }

    func = !/[<>%{}\s]/g.test(str) ? c.cache[str] ||
        tmpl(fs.readFileSync(str, 'utf8'), false) :
        new Function('data', 'tpl', 'var __tpl="";__tpl+="' +
            str.replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(c.interpolate, function(match, code) {
                return '"+' + code.replace(/\\"/g, '"') + '+"';
            })
            .replace(c.evaluate || null, function(match, code) {
                return '";' + code.replace(/\\"/g, '"')
                    .replace(/[\r\n\t]/g, ' ') + '__tpl+="';
            })
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t') +
            '";return __tpl;');
    if (func) {
        if (data !== false) {
            result = func(data, i);
        } else {
            result = func;
        }
    }
    return result;
};

exports.escapeHTML = escapeHTML;
exports.substr = substr;
exports.trueSize = trueSize;
exports.tmpl = tmpl;
exports.reload = function (str){
    delete tplSettings.cache[str];
};