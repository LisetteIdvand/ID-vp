const dateFormattedET = function(){	
	let timeNow = new Date();
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	const monthNamesET = ["näärikuu", "küünlakuu", "paastukuu", "jürikuu", "lehekuu", "jaanikuu", "heinakuu", "lõikuskuu", "mihklikuu", "viinakuu", "talvekuu", "jõulukuu"];
	return dateNow + ". " + monthNamesET[monthNow] + " " + yearNow;
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
module.exports = {time: timeFormattedET, date: dateFormattedET};