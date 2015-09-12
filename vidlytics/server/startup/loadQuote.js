Meteor.startup(function () {
	if (Quotes.find().count() === 0) {

		var quotes = [
			{
				'name': 'Dubstep-Free Zone',
				'description': 'Can we please just for an evening not listen to dubstep.'
				},
			{
				'name': 'All dubstep all the time',
				'description': 'Get it on!'
				},
			{
				'name': 'Savage lounging',
				'description': 'Leisure suit required. And only fiercest manners.'
				}
      ];

		for (var i = 0; i < quotes.length; i++)
			Quotes.insert(quotes[i]);

	}
});