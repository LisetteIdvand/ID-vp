const dateFormattedET = function(useFolk){	
	let timeNow = new Date();
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	//tavapärased kuunimed
	//const monthNamesET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
	//rahvakalendri kuunimed
	const folkMonthNamesET = ["näärikuu", "küünlakuu", "paastukuu", "jürikuu", "lehekuu", "jaanikuu", "heinakuu", "lõikuskuu", "mihklikuu", "viinakuu", "talvekuu", "jõulukuu"]
	let monthName
	return dateNow + ". " + folkMonthNamesET[monthNow] + " " + yearNow;
}

function dayFormattedET(){
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	let dayNamesET = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
	return dayNamesET[dayNow] + ", " + dateFormattedET();
}
const  addLeadZero = function(numValue){
	if(numValue < 10){
		numValue = '0' + numValue;
		//numValue = numValue.padStart(2, '0');
	}
	return numValue;
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	let timeFormattedET = hourNow + ":" + addLeadZero(minuteNow) + ":" + addLeadZero(secondNow);
	return timeFormattedET
}

//ekspordin kõik vajalikud funktsioonid koos mugavamate nimedega
module.exports = {time: timeFormattedET, date: dateFormattedET, weekday: dayFormattedET};