import { useEffect, useState } from "react";

export default function Countdown({
    start,
    onComplete,
}: {
    start: number;
    onComplete: () => void;
}) {
    const [countdown, setCountdown] = useState(start);
    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((countdown) => {
                if (countdown - 1 <= 0) {
                    onComplete();
                    return countdown;
                }
                return countdown - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (countdown < 0) {
        return null;
    }

    return <p>{countdown}</p>;
}
