const express=require('express');
const dateFns=require('date-fns');
const nodemailer=require('nodemailer');
const reminder=require('../models/Reminder');
const account=require('../models/Account');
const appointment=require('../models/Appointment');

const transporter = nodemailer.createTransport({
        service: "Gmail", 
        auth: {
            user: "marcelegacy32@gmail.com",
            pass: "lyfepzybvacfyfkv",
        },
        tls:{
            rejectUnauthorized: false
        }
});

async function createReminder (req){
    const newReminder =new reminder({
            reminderId: req.body.reminderId,
            title: req.body.title,
            dateTime: req.body.dateTime,
            activeFlag: req.body.activeFlag,
            appointmentId: req.body.appointmentId
    });
    const insertedReminder = await newReminder.save();
    return insertedReminder;
};

async function makeReminderEmail(reminderId, receiver)
{
    const reminderObject= await reminder.findOne({reminderId: reminderId});
    const linkedAppointment = await appointment.findOne({appointmentId: reminderObject.appointmentId});
    const linkedAccount = await account.findOne({accountId: linkedAppointment.accountId});
    const reminderMail ={
      from: "marcelegacy32@gmail.com", //Here would go the sender's mail
      to: receiver, //And here the account who created the reminder
      subject: "Recordatorio:"+reminderObject.title, 
      html: "<p>Tienes un pendiente,"+linkedAccount.name+"<br>"+
      "<strong>Tipo:</strong>"+linkedAppointment.type+"<br>"+
      "<strong>Fecha:</strong>"+linkedAppointment.date+"<br>"+
      "<strong>Detalles:</strong>"+linkedAppointment.description+"<br>"+
      "<strong>Información del contacto:</strong>"+linkedAppointment.contactInfo+"<br>"+
      "</p>", // html body
    };
    return reminderMail;
}
async function getNextId()
{
    const nextId=await reminder.countDocuments({})+1;
    return nextId;
}
module.exports = {
    transporter,
    createReminder,
    makeReminderEmail,
    getNextId
};


















