const employees = require('../Model/employee')
const attendances = require('../Model/attendance')
const { errorHandler, fetchData } = require('./services/services')
const fetch = require('node-fetch')

module.exports = {
    
    attendance_post : async (req, res) => {
        function getTime()  {
            var d = new Date();
            return d.getTime();
          }
          
          function checkTime()  {
            if (Math.abs(getTime() - oldtime) > 2000)  {  // Changed by more than 2 seconds?
              console.log("You changed the time!");
            }
            oldtime = getTime();
          }
          
          var oldtime = getTime();
          setInterval(checkTime, 1000);

        if (!req.body) {
            res.status(500).send('The system cannot process your attendance.')
        } else {
            try {
                const { emp_code, time_type, input_type } = req.body
                // FIND
                // const condition = (input_type === 'rfid') ? { rfid: emp_code } : { emp_code: emp_code }
                const condition = {$or: [{rfid: emp_code}, {emp_code: emp_code}]}
                const result = await employees.findOne(condition)
                
                if (result) {
                    // ASSIGN EMPLOYEE TABLE ID
                    const _id = result._id
                    const employee = await employees.find({emp_code})
                    const attendance = await attendances.timeIn(result.emp_code, _id, time_type) // pass emp code, emp table id
                    if (attendance) { res.status(200).send({ log_in: attendance, employee: employee }); }
                }else {
                    // THROW AN ERROR, IF ID DOES NOT EXIST
                    if (!emp_code) { throw Error(`Please enter valid employee code!`) }
                    throw Error(`ID Number: ${emp_code}, not recognized by the system!`)
                }
            } catch (err) {
                console.log(err)
                const error = errorHandler(err)
                res.status(500).send({ err: error })
            }
        }
    },
    
    case : async (req, res) => {
        res.render('Case', { url: req.url });
    },
    
    monitorTime : async (req, res) => {
        try {
            // const data = await fetchData('time_monito')
            res.status(200).render('timeAttendance', {
                url: req.url,
                currentDate: new Date().toLocaleDateString(),
                currentTime: new Date().toLocaleTimeString()
            })
        } catch (err) {
            console.log(err)
        }
    }   
}
