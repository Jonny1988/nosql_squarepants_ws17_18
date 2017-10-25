var mongodb = require('mongodb');

mongodb.connect("mongodb://localhost:27017/students", function(err,db){
	if (err) throw err;
	var coll = db.collection('students');
	coll.find( ).toArray(function(err,documents){
		for(var a in documents){
			console.log(JSON.stringify(documents[a]));
		}
		db.close();
	});
	/* Einfügen von Elemente in die Collection Students
	coll.insert({name: 'ahmed', age: '22', status: 'intern', semester: 8},function(err, res) {
		if (err) throw err;
		console.log("1 document inserted");
		db.close();
	});
	*/
});