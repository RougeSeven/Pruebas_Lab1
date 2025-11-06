const express = require('express');
const dateFns = require('date-fns');
const appointment = require('../models/Appointment');
const reminderControl = require('./reminderController');

async function getAppointmentsByMonth(accountId, month, year)
{
    const selectedMonth=Number(month)-1;
    const selectedYear=Number(year);
    const dateComparer=new Date(selectedYear,selectedMonth, 1);
    const monthAppointments=[];
    let appointmentDate;
    const appointmentList= await appointment.find({accountId: accountId});
        for(let appointment of appointmentList)
        {
            appointmentDate=new Date(appointment.date);
            if(dateFns.isSameMonth(dateComparer, appointmentDate))
            {
                monthAppointments.push(appointment);
            }
        }
    return monthAppointments;
}

async function getWeeklyAppointments(accountId){
    const currentDate=new Date();
    const weekStart=dateFns.startOfWeek(currentDate, {weekStartsOn: 1});
    const weekEnd=dateFns.endOfWeek(currentDate, {weekStartsOn: weekStart.getDay()});
    const weeklyAppointments= await appointment.find({accountId: accountId, date: {$gte: weekStart, $lte: weekEnd}});
    return weeklyAppointments;
};
async function getCloseAppointments(accountId){
    const currentDate=new Date();
    const threeDaysFromToday=dateFns.addDays(currentDate, 3);
    const closeAppointments= await appointment.find({accountId: accountId, date: {$gte: currentDate, $lte: threeDaysFromToday}});
    return closeAppointments;        
};
async function setReminder(id, title, daysBefore){
        const appointmentObject=await appointment.findOne({appointmentId: id});
        const newReminderId=await reminderControl.getNextId();
        const numDaysBefore=daysBefore;
        const reminderDate=dateFns.subDays(new Date(appointmentObject.date), numDaysBefore);
        const reminderData={
            body:{
                reminderId: newReminderId,
                title: title ?? appointmentObject.type,
                dateTime: reminderDate,
                activeFlag: true,
                appointmentId: appointmentObject.appointmentId
            }
        };
        const createdReminder=await reminderControl.createReminder(reminderData);
        return createdReminder;
};
module.exports={
    getAppointmentsByMonth,
    getWeeklyAppointments,
    getCloseAppointments,
    setReminder
}