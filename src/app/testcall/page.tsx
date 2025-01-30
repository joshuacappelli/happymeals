// pages/index.tsx

'use client';
import Head from 'next/head';
import CallForm from '@/components/form/callform';

const TestCallPage = () => {
  return (
    <>
      <Head>
        <title>Twilio Call App</title>
      </Head>
      <main>
        <h1>Welcome to the Twilio Call App</h1>
        <CallForm />
      </main>
    </>
  );
};

export default TestCallPage;
