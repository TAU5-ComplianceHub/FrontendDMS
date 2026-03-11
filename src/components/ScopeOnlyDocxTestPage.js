import React, { useMemo, useState } from "react";
import axios from "axios";

export default function ScopeOnlyDocxTestPage() {
    const [scopeBlocks, setScopeBlocks] = useState([
        { type: "text", text: "" }
    ]);
    const [loading, setLoading] = useState(false);

    const addBlock = (type = "text") => {
        setScopeBlocks((prev) => [...prev, { type, text: "" }]);
    };

    const updateBlock = (index, field, value) => {
        setScopeBlocks((prev) =>
            prev.map((block, i) =>
                i === index ? { ...block, [field]: value } : block
            )
        );
    };

    const removeBlock = (index) => {
        setScopeBlocks((prev) => prev.filter((_, i) => i !== index));
    };

    const moveBlock = (index, direction) => {
        setScopeBlocks((prev) => {
            const next = [...prev];
            const targetIndex = index + direction;

            if (targetIndex < 0 || targetIndex >= next.length) {
                return prev;
            }

            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    };

    const payload = useMemo(() => {
        return {
            formData: {
                scope: scopeBlocks
                    .map((item) => ({
                        type: item.type === "bullet" ? "bullet" : "text",
                        text: String(item.text || "").trim()
                    }))
                    .filter((item) => item.text !== "")
            }
        };
    }, [scopeBlocks]);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${process.env.REACT_APP_URL}/api/docCreate/generate-scope-only-docx`,
                payload,
                {
                    responseType: "blob",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "scope-only-test.docx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Failed to generate scope test document:", error);
            alert("Failed to generate scope test document");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
            <h1>Scope Only DOCX Test</h1>
            <p>
                Add text and bullet blocks in any order. The backend will send them to Word
                in the same order.
            </p>

            {scopeBlocks.map((block, index) => (
                <div
                    key={index}
                    style={{
                        border: "1px solid #d0d0d0",
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 12,
                        background: "#fafafa"
                    }}
                >
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                        <select
                            value={block.type}
                            onChange={(e) => updateBlock(index, "type", e.target.value)}
                            style={{ padding: 8 }}
                        >
                            <option value="text">Text</option>
                            <option value="bullet">Bullet</option>
                        </select>

                        <button type="button" onClick={() => moveBlock(index, -1)}>
                            Up
                        </button>

                        <button type="button" onClick={() => moveBlock(index, 1)}>
                            Down
                        </button>

                        <button type="button" onClick={() => removeBlock(index)}>
                            Remove
                        </button>
                    </div>

                    <textarea
                        rows={block.type === "text" ? 4 : 2}
                        value={block.text}
                        onChange={(e) => updateBlock(index, "text", e.target.value)}
                        placeholder={block.type === "bullet" ? "Enter bullet text" : "Enter paragraph text"}
                        style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 6,
                            border: "1px solid #c8c8c8",
                            resize: "vertical"
                        }}
                    />
                </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button type="button" onClick={() => addBlock("text")}>
                    Add Text
                </button>
                <button type="button" onClick={() => addBlock("bullet")}>
                    Add Bullet
                </button>
            </div>

            <button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? "Generating..." : "Generate Scope DOCX"}
            </button>

            <div style={{ marginTop: 24 }}>
                <h3>Payload preview</h3>
                <pre
                    style={{
                        background: "#f4f4f4",
                        padding: 16,
                        borderRadius: 8,
                        overflowX: "auto"
                    }}
                >
                    {JSON.stringify(payload, null, 2)}
                </pre>
            </div>
        </div>
    );
}