import { useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import styles from "./CountDownTimer.module.css";

export type CountDownVariant = "accent" | "destructive" | "success" | "warning";

export interface CountDownTimerProps extends HTMLAttributes<HTMLDivElement> {
    /** Start date for the countdown */
    start: Date;
    /** End date for the countdown */
    end: Date;
    /** Format to display: "date", "time", or "datetime" */
    format?: "date" | "time" | "datetime";
    /** Visual style variant. Defaults to `"accent"`. */
    variant?: CountDownVariant;
    /** Callback action to execute when countdown reaches zero */
    action?: () => void;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isFinished: boolean;
}

/**
 * CountDown timer component that displays remaining time and executes an action when time runs out.
 *
 * @see https://developer.gnome.org/hig/patterns/
 */
export function CountDownTimer({
    start,
    end,
    format = "time",
    variant = "accent",
    action,
    className,
    ...props
}: CountDownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
    const [hasExecutedAction, setHasExecutedAction] = useState(false);

    useEffect(() => {
        const calculateTimeRemaining = (): TimeRemaining => {
            const now = new Date();
            const endTime = new Date(end).getTime();
            const nowTime = now.getTime();
            const difference = endTime - nowTime;

            if (difference <= 0) {
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isFinished: true,
                };
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            return {
                days,
                hours,
                minutes,
                seconds,
                isFinished: false,
            };
        };

        // Initial calculation
        setTimeRemaining(calculateTimeRemaining());

        // Update every second
        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);

            // Execute action when countdown finishes
            if (remaining.isFinished && !hasExecutedAction) {
                action?.();
                setHasExecutedAction(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [end, action, hasExecutedAction]);

    if (!timeRemaining) {
        return null;
    }

    const formatTime = (): string => {
        if (format === "date") {
            const endDate = new Date(end);
            return endDate.toLocaleDateString();
        }

        const { days, hours, minutes, seconds, isFinished } = timeRemaining;

        if (isFinished) {
            return "00:00:00";
        }

        if (format === "datetime") {
            const endDate = new Date(end);
            const dateString = endDate.toLocaleDateString();
            const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            return `${dateString} ${timeString}`;
        }

        if (days > 0) {
            return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
        }

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const displayVariant = timeRemaining.isFinished ? "destructive" : variant;

    return (
        <div
            className={[
                styles.countdownTimer,
                styles[displayVariant],
                timeRemaining.isFinished ? styles.finished : null,
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            <span className={styles.value}>{formatTime()}</span>
        </div>
    );
}
