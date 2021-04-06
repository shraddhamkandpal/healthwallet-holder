import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import {storeSignedVCs} from '../utils/apiService';
import {Button} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import DisplayCredentials from './DisplayCredentials';

const AcceptCredentials = (props) => {
    const history = useHistory();

    const [cred, setCred] = useState();

    const saveCredential = async (credential) => {
        try {
            const {credentialIds} = await storeSignedVCs({
                data: [credential]
              });
            console.log(credentialIds[0]);
          history.push('/');
        } catch (error){
            console.log(error)
        }
    }

    const setCredential = async (endPoint) => {
        try {
            const credential = await fetch(endPoint).then(res => res.json())
            console.log(credential)
            setCred(credential)
        } catch (error){
            console.log(error)
        }
    }

    useEffect(() => {
        if (queryString.parse(props.location.search).vcURL) {
            console.log(queryString.parse(props.location.search).vcURL);
            setCredential(queryString.parse(props.location.search).vcURL);
        }
    }, [])

    return (
        <div className='tutorial'>
          <div className='tutorial__step'>
            { cred ? (
              <DisplayCredentials cred={cred}/>
              ) : <h3>No Verifiable Credential found</h3> }
            <Button style={{display: 'block', margin: '10px 0 0 0'}} onClick={() => saveCredential(cred)}>Save VC</Button>       
            <Button style={{display: 'block', margin: '10px 0 0 0'}} onClick={() => history.push('/')}>Reject VC</Button>       
        </div>
      </div>
    )
}
export default AcceptCredentials