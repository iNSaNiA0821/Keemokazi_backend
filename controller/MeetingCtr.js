const Meeting = require("../models/MeetingModel");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

exports.getMeetingschedule = async (req, res) => {
  try {
    var getAllMeeting = await Meeting.find();
    res.status(200).json({ msg: getAllMeeting });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};

exports.meetingschedule = async (req, res) => {
  try {
    const meeting = await Meeting.find({ email: req.body.send_data.email });

    const samemeeting = meeting.map((item) => {
      if (
        new Date(item.start).getMonth() ===
        new Date(req.body.send_data.start).getMonth()
      ) {
        return true;
      } else {
        return false;
      }
    });

    const meetingfilter = samemeeting.includes(true);
    if (meetingfilter)
      return res
        .status(400)
        .json({ errors: "This month's meeting is already scheduled!" });

    const newMeeting = new Meeting({
      start: req.body.send_data.start,
      end: req.body.send_data.end,
      title: req.body.send_data.title,
      email: req.body.send_data.email,
      link: req.body.send_data.link,
    });
    const created_id = await newMeeting
      .save()
      .then((res) => {
        if (res) {
          return res._id;
        }
      })
      .catch((error) => {
        console.error(
          "No internet connection found. App is running in offline mode.",
          error
        );
      });

    // console.log(created_id);

    const output = `
    <!DOCTYPE html>
      <html>
        <head>
          <style>
            h4 {
              background: greenyellow;
              padding: 10px;
              border: 1px solid green;
            }
          </style>
        </head>
        <body>
            <div>
              <h4>Time: ${req.body.send_data.start} ~ ${req.body.send_data.end} PST</h4>
              <h4>kareem.hesri@outlook.com and ${req.body.send_data.email} Meeting</h4>
              <h4>Name: ${req.body.send_data.title}</h4>
              <h4>Meeting Link: ${req.body.send_data.link}</h4>
            </div>
        </body>
      </html>
  `;

    var transport = nodemailer.createTransport(
      smtpTransport({
        service: "Gmail",
        auth: {
          user: "smartcode132@gmail.com",
          pass: "vzqdixjhiqhnedva",
        },
      })
    );

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: "Keemokazi Consulting Meeting <no-reply@keemokaziconsulting.meeting.org>", // sender address
      // to: `kareem.hesri@outlook.com, victoryp00821@gmail.com, ${req.body.send_data.email}`, // list of receivers
      to: `victoryp00821@gmail.com, ${req.body.send_data.email}`, // list of receivers
      subject: "Keemokazi Consulting Meeting", // Subject line
      text: "", // plaintext body
      html: output, // html body
    };

    // send mail with defined transport object
    transport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      } else {
        // console.log("Message sent: " + response.message);
        res.status(200).json({ msg: "success", id: created_id });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};

exports.deletemeetingschedule = async (req, res) => {
  // console.log(111);
  // console.log(req.body.id);
  try {
    await Meeting.findOne({ _id: req.body.id })
      .then(async (item) => {
        if (item.email === req.body.email) {
          const deleted_data = await Meeting.findByIdAndDelete(req.body.id)
            .then((deleted) => {
              return deleted;
            })
            .catch((error) => {
              console.error(
                "No internet connection found. App is running in offline mode.",
                error
              );
            });

          // console.log(deleted_data);

          const output = `
    <!DOCTYPE html>
      <html>
        <head>
          <style>
            h4 {
              background: darkred;
              padding: 10px;
              border: 1px solid white;
              color: white;
            }
          </style>
        </head>
        <body>
            <div>
              <h2>This Meeting has been Canceled!</h2>
              <h4>Time: ${deleted_data.start} ~ ${deleted_data.end} PST</h4>
              <h4>kareem.hesri@outlook.com and ${deleted_data.email} Meeting</h4>
              <h4>Name: ${deleted_data.title}</h4>
            </div>
        </body>
      </html>
  `;

          var transport = nodemailer.createTransport(
            smtpTransport({
              service: "Gmail",
              auth: {
                user: "smartcode132@gmail.com",
                pass: "vzqdixjhiqhnedva",
              },
            })
          );

          // setup e-mail data with unicode symbols
          var mailOptions = {
            from: "Keemokazi Consulting Meeting <no-reply@keemokaziconsulting.meeting.org>", // sender address
            // to: `kareem.hesri@outlook.com, victoryp00821@gmail.com, ${req.body.send_data.email}`, // list of receivers
            to: `victoryp00821@gmail.com, ${deleted_data.email}`, // list of receivers
            subject: "Keemokazi Consulting Meeting", // Subject line
            text: "", // plaintext body
            html: output, // html body
          };

          // send mail with defined transport object
          transport.sendMail(mailOptions, async function (error, response) {
            if (error) {
              console.log(error);
            } else {
              var getallmeeting = await Meeting.find();
              res.status(200).json({ msg: getallmeeting });
              // console.log("Message sent: " + response.message);
            }
          });

          // res.status(200).json({ msg: getAllMeeting });
        } else {
          res.status(400).json({ errors: "This is not your meeting!" });
        }
      })
      .catch((error) => {
        console.error(
          "No internet connection found. App is running in offline mode.",
          error
        );
      });
    // var meetingID = ObjectId(req.body.id);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};

exports.editmeetingschedule = async (req, res) => {
  try {
    const data = {
      start: req.body.data.start,
      end: req.body.data.end,
      title: req.body.data.title,
    };
    // console.log(data);
    await Meeting.findOne({ _id: req.body.data.id })
      .then(async (item) => {
        if (item.email === req.body.email) {
          const updated_data = await Meeting.findByIdAndUpdate(
            req.body.data.id,
            data
          )
            .then((updated) => {
              return updated;
            })
            .catch((error) => {
              console.error(
                "No internet connection found. App is running in offline mode.",
                error
              );
            });

          // console.log(updated_data);

          const output = `
    <!DOCTYPE html>
      <html>
        <head>
          <style>
            h4 {
              background: lightblue;
              padding: 10px;
              border: 1px solid blue;
              color: black;
            }
          </style>
        </head>
        <body>
            <div>
              <h2>This Meeting has been Updated!</h2>
              <h4>Time: ${req.body.data.start} ~ ${req.body.data.end} PST</h4>
              <h4>kareem.hesri@outlook.com and ${updated_data.email} Meeting</h4>
              <h4>Name: ${req.body.data.title}</h4>
            </div>
        </body>
      </html>
  `;

          var transport = nodemailer.createTransport(
            smtpTransport({
              service: "Gmail",
              auth: {
                user: "smartcode132@gmail.com",
                pass: "vzqdixjhiqhnedva",
              },
            })
          );

          // setup e-mail data with unicode symbols
          var mailOptions = {
            from: "Keemokazi Consulting Meeting <no-reply@keemokaziconsulting.meeting.org>", // sender address
            // to: `kareem.hesri@outlook.com, victoryp00821@gmail.com, ${req.body.send_data.email}`, // list of receivers
            to: `victoryp00821@gmail.com, ${updated_data.email}`, // list of receivers
            subject: "Keemokazi Consulting Meeting", // Subject line
            text: "", // plaintext body
            html: output, // html body
          };

          // send mail with defined transport object
          transport.sendMail(mailOptions, async function (error, response) {
            if (error) {
              console.log(error);
            } else {
              var getallmeeting = await Meeting.find();
              res.status(200).json({ msg: getallmeeting });
              // console.log("Message sent: " + response.message);
            }
          });

          // res.status(200).json({ msg: getAllMeeting });
        } else {
          res.status(400).json({ errors: "This is not your meeting!" });
        }
      })
      .catch((error) => {
        console.error(
          "No internet connection found. App is running in offline mode.",
          error
        );
      });
    // var meetingID = ObjectId(req.body.id);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};
