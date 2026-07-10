import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import "./FAQ.css";

function FAQ() {

    const faqs = [
        {
            question: "How does SmartQueue reduce waiting time?",
            answer:
                "SmartQueue organizes patient queues digitally, provides live queue updates, and optimizes appointment scheduling to reduce unnecessary waiting."
        },
        {
            question: "Can patients track their queue in real time?",
            answer:
                "Yes. Patients can view their current token number, estimated waiting time, and queue status in real time."
        },
        {
            question: "Is appointment booking available online?",
            answer:
                "Yes. Patients can book appointments online by selecting their preferred doctor and available time slot."
        },
        {
            question: "Who can use SmartQueue?",
            answer:
                "SmartQueue is designed for Patients, Receptionists, Doctors, and Hospital Administrators."
        },
        {
            question: "Is patient information secure?",
            answer:
                "Yes. The system uses secure authentication and role-based access to protect patient information."
        },
        {
            question: "Can hospitals customize SmartQueue?",
            answer:
                "Yes. Hospitals can configure doctors, departments, appointment timings, and queue settings based on their workflow."
        }
    ];

    const [openIndex, setOpenIndex] = useState(0);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section className="faq-section" id="faq">

            <div className="faq-heading">

                <span>FAQ</span>

                <h2>Frequently Asked Questions</h2>

                <p>
                    Everything you need to know about SmartQueue.
                </p>

            </div>

            <div className="faq-container">

                {faqs.map((faq, index) => (

                    <div
                        className={`faq-item ${openIndex === index ? "active" : ""}`}
                        key={index}
                    >

                        <div
                            className="faq-question"
                            onClick={() => toggleFAQ(index)}
                        >

                            <h3>{faq.question}</h3>

                            {openIndex === index ? <FaMinus /> : <FaPlus />}

                        </div>

                        {openIndex === index && (

                            <div className="faq-answer">

                                <p>{faq.answer}</p>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </section>
    );
}

export default FAQ;