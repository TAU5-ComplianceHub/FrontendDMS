import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import HelpPillButton from "./HelpPillButton";

export default function HelpPanel({ studentId, courseId, token }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);

    const endRef = useRef(null);

    const base = process.env.REACT_APP_URL || "";

    const loadMessages = async () => {
        if (!studentId || !courseId) {
            setMessages([]);
            setChatId(null);
            return;
        }

        setLoadingMsgs(true);
        try {
            const res = await fetch(`${base}/api/chatBoxOnlineTraining/load`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ studentId, courseId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to load messages");

            setChatId(data.chatId || null);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
        } catch (e) {
            console.error(e);
            // fail safe: show empty
            setMessages([]);
            setChatId(null);
        } finally {
            setLoadingMsgs(false);
        }
    };

    const sendMessage = async () => {
        const text = message.trim();
        if (!text) return;
        if (!studentId || !courseId) return;

        // optimistic UI
        const optimistic = {
            _id: `tmp-${Date.now()}`,
            senderRole: "student",
            senderId: studentId,
            body: text,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };

        setMessages((prev) => [...prev, optimistic]);
        setMessage("");

        try {
            const res = await fetch(`${base}/api/chatBoxOnlineTraining/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ studentId, courseId, body: text }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to send");

            if (data.chatId) setChatId(data.chatId);

            // Replace optimistic with server message
            setMessages((prev) => {
                const withoutOptimistic = prev.filter((m) => m._id !== optimistic._id);
                return [...withoutOptimistic, data.message];
            });
        } catch (e) {
            console.error(e);
            // If send failed, remove optimistic message (or mark it failed)
            setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
            // You can toast here if you want
        }
    };

    // Load messages on open
    useEffect(() => {
        if (!open) return;
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, studentId, courseId]);

    // Auto-scroll
    useEffect(() => {
        if (!open) return;
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [open, messages.length]);

    return (
        <>
            <HelpPillButton onClick={() => setOpen(!open)} label="Help" />

            {open && (
                <div
                    className="helpPanel__backdrop"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className={`helpPanel__panel ${open ? "is-open" : ""}`} role="dialog" aria-label="Help">
                <div className="helpPanel__header">
                    <div className="helpPanel__title">Help</div>

                    <button
                        type="button"
                        className="helpPanel__close"
                        onClick={() => setOpen(false)}
                        aria-label="Close help"
                        title="Close"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="helpPanel__body">
                    <div className="helpPanel__messages" aria-label="Chat messages">
                        {loadingMsgs && (
                            <div style={{ padding: 10, fontSize: 12, opacity: 0.7 }}>
                                Loading…
                            </div>
                        )}

                        {messages.map((m) => {
                            const isUser = m.senderRole === "student"; // student messages right side
                            return (
                                <div
                                    key={m._id || `${m.createdAt}-${m.body}`}
                                    className={`helpPanel__msgRow ${isUser ? "is-user" : ""}`}
                                >
                                    <div className="helpPanel__bubble">{m.body}</div>
                                </div>
                            );
                        })}

                        {!loadingMsgs && messages.length === 0 && (
                            <div style={{ padding: 10, fontSize: 12, opacity: 0.7 }}>
                                No messages yet. Ask a question to start a chat.
                            </div>
                        )}

                        <div ref={endRef} />
                    </div>
                </div>

                <div className="helpPanel__inputbar">
                    <input
                        className="helpPanel__input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your question…"
                        aria-label="Help message"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") sendMessage();
                        }}
                    />

                    <button
                        type="button"
                        className="helpPanel__send"
                        aria-label="Send"
                        title="Send"
                        onClick={sendMessage}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>

                {/* Optional: debug line */}
                {/* <div style={{ fontSize: 10, opacity: 0.5, padding: 6 }}>chatId: {chatId || "none"}</div> */}
            </div>
        </>
    );
}
