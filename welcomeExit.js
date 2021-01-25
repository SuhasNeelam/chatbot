function welcome(agent) {
    var ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9);
    };
    agent.add('Welcome to Flight Booking ChatBot! Your ticket number is  '+ID());
    console.log(ID());
}
function complaintService(agent){
      var number = agent.context.get("ComplaintService-followup").parameters.phone-number;

      agent.add(`Hello ${number}, your : ${email}. We confirmed your meeting.`);

      return db.collection('meeting').add({
        name : name,
        email : email,
        time : Date.now()
      }).then(ref =>
        console.log("Meeting details added to DB")
        )

    }
function defaultFallback(agent) {
    agent.add('Sorry! I am unable to understand this at the moment. I am still learning humans. You can pick any of the service that might help me. from node');
}
module.exports = { welcome: welcome, defaultFallback: defaultFallback, complaintService:complaintService };