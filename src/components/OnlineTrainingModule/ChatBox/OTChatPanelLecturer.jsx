import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function OTChatPanelLecturer({ open, onClose, studentId, courseId, token, chatId }) {
    const [messages, setMessages] = useState([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [claiming, setClaiming] = useState(false);

    const endRef = useRef(null);
    const base = process.env.REACT_APP_URL || "";

    useEffect(() => {
        console.log("OTChatPanelLecturer props:", { open, studentId, courseId, chatId });
    }, []);

    const loadMessages = async () => {
        if (!studentId || !courseId) {
            setMessages([]);
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

            setMessages(Array.isArray(data.messages) ? data.messages : []);
        } catch (e) {
            console.error(e);
            setMessages([]);
        } finally {
            setLoadingMsgs(false);
        }
    };

    const claimChat = async () => {
        if (!chatId) return;
        setClaiming(true);
        try {
            const res = await fetch(`${base}/api/chatBoxOnlineTraining/claim`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ chatId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to claim chat");

            // Optionally close after claim
            onClose?.();
        } catch (e) {
            console.error(e);
            alert(e.message || "Failed to claim chat");
        } finally {
            setClaiming(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, studentId, courseId]);

    useEffect(() => {
        if (!open) return;
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [open, messages.length]);

    return (
        <>
            {open && (
                <div
                    className="helpPanel__backdrop"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <div style={{ right: "10px", bottom: "20px" }} className={`helpPanel__panel ${open ? "is-open" : ""}`} role="dialog" aria-label="Chat">
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
                            // Lecturer is the viewer in this panel
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

                {/* bottom bar: CLAIM ONLY */}
                <div className="helpPanel__inputbar" style={{ gridTemplateColumns: "1fr" }}>
                    <button
                        type="button"
                        className="helpPanel__claim"
                        onClick={claimChat}
                        disabled={claiming || !chatId}
                        title="Claim chat"
                        style={{ width: "100%" }}
                    >
                        {claiming ? "Claiming..." : "Claim"}
                    </button>
                </div>
            </div>
        </>
    );
}