import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export default function OTChatPanelLecturerClaimed({
    open,
    onClose,
    token,
    chatId
}) {
    const [messages, setMessages] = useState([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [message, setMessage] = useState("");

    const endRef = useRef(null);
    const base = process.env.REACT_APP_URL || "";

    const loadMessages = async () => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        setLoadingMsgs(true);
        try {
            const res = await fetch(`${base}/api/chatBoxOnlineTraining/load-lecturer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ chatId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to load messages");

            setMessages(Array.isArray(data.messages) ? data.messages : []);
        } catch (e) {
            console.error(e);
            setMessages([]);
        } finally {
            setLoadingMsgs(false);
        }
    };

    const sendMessage = async () => {
        const text = message.trim();
        if (!text) return;
        if (!chatId) return;

        // optimistic bubble on UI (lecturer = viewer = right)
        const optimistic = {
            _id: `tmp-${Date.now()}`,
            senderRole: "lecturer",
            senderId: "lecturer",
            body: text,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };

        setMessages((prev) => [...prev, optimistic]);
        setMessage("");

        try {
            const res = await fetch(`${base}/api/chatBoxOnlineTraining/send-lecturer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                // IMPORTANT: backend must support lecturer role OR infer role from token
                body: JSON.stringify({ chatId, body: text, senderRole: "lecturer" }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to send");

            // replace optimistic with actual message
            setMessages((prev) => {
                const cleaned = prev.filter((m) => m._id !== optimistic._id);
                return [...cleaned, data.message];
            });
        } catch (e) {
            console.error(e);
            // remove optimistic if failed
            setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
            alert(e.message || "Failed to send message");
        }
    };

    useEffect(() => {
        if (!open) return;
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, chatId]);

    useEffect(() => {
        if (!open) return;
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [open, messages.length]);

    return (
        <>
            {open && (
                <div className="helpPanel__backdrop" onClick={onClose} aria-hidden="true" />
            )}

            <div
                style={{ right: "10px", bottom: "20px" }}
                className={`helpPanel__panel ${open ? "is-open" : ""}`}
                role="dialog"
                aria-label="Chat"
            >
                <div className="helpPanel__header">
                    <div className="helpPanel__title">Chat</div>

                    <button
                        type="button"
                        className="helpPanel__close"
                        onClick={onClose}
                        aria-label="Close chat"
                        title="Close"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="helpPanel__body">
                    <div className="helpPanel__messages" aria-label="Chat messages">
                        {loadingMsgs && (
                            <div style={{ padding: 10, fontSize: 12, opacity: 0.7 }}>Loading…</div>
                        )}

                        {messages.map((m) => {
                            const isLecturerMessage = m.senderRole === "lecturer";
                            return (
                                <div
                                    key={m._id || `${m.createdAt}-${m.body}`}
                                    className={`helpPanel__msgRow ${isLecturerMessage ? "is-user" : ""}`}
                                >
                                    <div className="helpPanel__bubble">{m.body}</div>
                                </div>
                            );
                        })}

                        {!loadingMsgs && messages.length === 0 && (
                            <div style={{ padding: 10, fontSize: 12, opacity: 0.7 }}>
                                No messages yet.
                            </div>
                        )}

                        <div ref={endRef} />
                    </div>
                </div>

                {/* bottom bar: INPUT + SEND */}
                <div className="helpPanel__inputbar">
                    <input
                        className="helpPanel__input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a reply…"
                        aria-label="Chat reply"
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
            </div>
        </>
    );
}
