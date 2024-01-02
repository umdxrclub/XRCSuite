import React, { useState, useEffect } from "react";
import "./tv-footer.css";

interface Clock {
  time: string;
  date: string;
}

const TVFooter: React.FC = () => {
  const [clock, setClock] = useState<Clock>({
    time: "Breh",
    date: "lol",
  });

  useEffect(() => {
    let timeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })

    let dateFormatter = new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        year: "numeric",
        month: "long",
        weekday: "long",
    })

    let updateInterval = setInterval(() => {
        setClock({
            time: timeFormatter.format(Date.now()),
            date: dateFormatter.format(Date.now())
        })
    }, 1000);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  return (
    <div className="tv-footer">
      <h1>{clock.time}</h1>
      <h4>{clock.date}</h4>
    </div>
  );
};

export default TVFooter;
