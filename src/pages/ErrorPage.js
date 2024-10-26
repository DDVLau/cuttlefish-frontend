import {useEffect} from 'react';
import { useRouteError } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import favicon from "../images/favicon.ico";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getUserInfo } from '../Utilities';

const ErrorPage = () =>{
    useEffect(() => {
        document.title = "Cuttlefish | React";
        document.querySelector("link[rel~='icon']").href = favicon;
    }, []);
    
    const error = useRouteError();
    console.error(error);

    const {username, api_token} = getUserInfo();

    return (
        <>
        <Header prolificID={username} activeTab={-1} />
            <div className="container-fullhd">
                <figure class="text-center m-5">
                    <h1>Oops!</h1>
                    <p>Sorry, an unexpected error has occurred.</p>
                    <p>
                        <i>Error code: {error.statusText || error.message}</i>
                    </p>
                    <p>
                        Please contact us on <a href='https://www.prolific.com/'>Prolific</a> platform.
                    </p>
                </figure>
            </div>
        <Footer />
        </>
    );
}

export default ErrorPage;