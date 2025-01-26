import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { router } from '@inertiajs/react';

const SendSMSForm = () => {
    const { data, setData, post, processing, errors } = useForm({
        to: "",
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post('/send-sms', {
            to: data.to,
            message: data.message,
        });
    };


    return (
        <div>
            <h1>Send SMS</h1>
            <form onSubmit={handleSubmit}>
                {/* رقم الهاتف */}
                <div>
                    <label htmlFor="to">Phone Number:</label>
                    <input
                        type="text"
                        id="to"
                        name="to"
                        value={data.to}
                        onChange={(e) => setData("to", e.target.value)}
                        placeholder="+1234567890"
                    />
                    {errors.to && <div style={{ color: "red" }}>{errors.to}</div>}
                </div>

                {/* نص الرسالة */}
                <div>
                    <label htmlFor="message">Message:</label>
                    <textarea
                        id="message"
                        name="message"
                        value={data.message}
                        onChange={(e) => setData("message", e.target.value)}
                        placeholder="Type your message here"
                    />
                    {errors.message && (
                        <div style={{ color: "red" }}>{errors.message}</div>
                    )}
                </div>

                {/* زر الإرسال */}
                <div>
                    <button type="submit" disabled={processing}>
                        {processing ? "Sending..." : "Send SMS"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SendSMSForm;
