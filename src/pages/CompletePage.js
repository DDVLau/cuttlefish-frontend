import React, { useEffect, useState } from 'react';

import Header from "../components/Header";
import Footer from "../components/Footer";
import { getUserInfo } from '../Utilities';

const SurveyCompletion = () => {
  const [seconds, setSeconds] = useState(3);
  const { username, api_token } = getUserInfo();
  let verifyId = "UNKNOWN";

  const query = new URLSearchParams(window.location.search);
  const status = query.get('status');
  
  if (status === 'withdrawn') {
    verifyId = process.env.REACT_APP_PROLIFIC_WITHDRAWN_VID;
  } else if (status === 'completed') {
    verifyId = process.env.REACT_APP_PROLIFIC_COMPLETED_VID;
  }

  const FINISH_URL = `https://app.prolific.com/submissions/complete?cc=${verifyId}`;


  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      window.location.href = FINISH_URL;
    }
  }, [seconds]);

  return (
    <>
        <Header prolificID={username} activeTab={-1} />
        <div className="container-fullhd">
          <figure class="text-center m-5">
            <h1 className="title">Thank you for participating in this study!</h1>
            <p className="subtitle">
              You will be redirected in <span>{seconds}</span> seconds,{' '}
              <a href={FINISH_URL}>or you can click here</a>.
            </p>
          </figure>
        </div>
        <Footer />
    </>
  );
};

export default SurveyCompletion;