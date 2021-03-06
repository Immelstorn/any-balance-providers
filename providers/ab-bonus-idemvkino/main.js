﻿/**
Провайдер AnyBalance (http://any-balance-providers.googlecode.com)
*/

var g_headers = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Accept-Charset': 'windows-1251,utf-8;q=0.7,*;q=0.3',
	'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
	'Connection': 'keep-alive',
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.76 Safari/537.36',
};

function main() {
	var prefs = AnyBalance.getPreferences();
	var baseurl = 'http://www.idemvkino.ru/';
	AnyBalance.setDefaultCharset('windows-1251');
	
	checkEmpty(prefs.login, 'Введите логин!');
	checkEmpty(prefs.password, 'Введите пароль!');
	
	var html = AnyBalance.requestGet(baseurl + 'verybonus/enter/rezervation/', g_headers);
	
	html = AnyBalance.requestPost(baseurl + 'verybonus/enter/rezervation/', {
		'city':'0',
		'login': prefs.login,
		'pass': prefs.password,
		'film':'',
		'film_id':'',
		'cinema_id':'',
		'cinema':'',
		'date':'',
		'time':'',
		'auth':'1'
	}, addHeaders({Referer: baseurl + 'verybonus/enter/rezervation/'}));
	
	if (!/>Выход</i.test(html)) {
		var error = getParam(html, null, null, /<div[^>]+class="t-error"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i, replaceTagsAndSpaces, html_entity_decode);
		if (error)
			throw new AnyBalance.Error(error, null, /Неверный логин или пароль/i.test(error));
		
		AnyBalance.trace(html);
		throw new AnyBalance.Error('Не удалось зайти в личный кабинет. Сайт изменен?');
	}
	
	html = AnyBalance.requestGet(baseurl + 'verybonus/enter/many/', g_headers);
	
	var result = {success: true};
	
	getParam(html, result, 'balance', /Накопленные бонусы:([^>]*>){3}/i, [replaceTagsAndSpaces, /(\s*руб\s*)/i, ','], parseBalance);
	getParam(html, result, 'discount', /Предоставленные скидки:([^>]*>){3}/i, [replaceTagsAndSpaces, /(\s*руб\s*)/i, ','], parseBalance);
	getParam(html, result, 'payed', /Потраченые средства:([^>]*>){3}/i, [replaceTagsAndSpaces, /(\s*руб\s*)/i, ','], parseBalance);
	
	AnyBalance.setResult(result);
}