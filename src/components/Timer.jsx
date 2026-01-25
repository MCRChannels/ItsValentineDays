import { useState, useEffect } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

const Timer = () => {
    const [timeLeft, setTimeLeft] = useState({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const startDate = new Date(2024, 1, 15, 20, 0, 0);

        const timer = setInterval(() => {
            const now = new Date();

            const years = differenceInYears(now, startDate);
            const months = differenceInMonths(now, startDate) % 12;

            let tempDate = new Date(startDate);
            tempDate.setFullYear(tempDate.getFullYear() + years);
            tempDate.setMonth(tempDate.getMonth() + months);

            const days = Math.floor((now - tempDate) / (1000 * 60 * 60 * 24));

            const hours = differenceInHours(now, startDate) % 24;
            const minutes = differenceInMinutes(now, startDate) % 60;
            const seconds = differenceInSeconds(now, startDate) % 60;

            setTimeLeft({ years, months, days: days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label }) => (
        <div className="timer-item">
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c9184a' }}>{value}</span>
            <span style={{ fontSize: '0.8rem', color: '#590d22', textTransform: 'uppercase' }}>{label}</span>
        </div>
    );

    return (
        <div className="timer-grid">
            <TimeUnit value={timeLeft.years} label="Years" />
            <TimeUnit value={timeLeft.months} label="Months" />
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>
    );
};

export default Timer;
