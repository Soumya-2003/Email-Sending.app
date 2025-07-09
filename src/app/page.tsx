'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState({
    id: '',
    to: '',
    from: '',
    subject: '',
    body: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmail({ ...email, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Send Email</h1>
      <input name="id" placeholder="ID" onChange={handleChange} style={styles.input} />
      <input name="to" placeholder="To" onChange={handleChange} style={styles.input} />
      <input name="from" placeholder="From" onChange={handleChange} style={styles.input} />
      <input name="subject" placeholder="Subject" onChange={handleChange} style={styles.input} />
      <textarea name="body" placeholder="Body" onChange={handleChange} style={styles.textarea} />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}

const styles = {
  input: { display: 'block', width: '100%', margin: '0.5rem 0', padding: '0.5rem' },
  textarea: { width: '100%', height: '100px', margin: '0.5rem 0', padding: '0.5rem' },
};