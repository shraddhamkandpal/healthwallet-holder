import React, { useEffect, useState} from 'react';
import {Button, Table} from 'react-bootstrap';
import 'pages/holder/Holder.scss'
import ApiService from 'utils/apiService';
import FirebaseService from 'utils/firebaseService';
import {GetSignedCredentialsFireBaseOutput} from 'utils/firebase/index';
import {GetSavedCredentialsOutput, UnsignedW3cCredential, W3cCredential} from 'utils/apis';
import FireBaseService from 'utils/firebaseService';

interface State {
  currentUnsignedVC: UnsignedW3cCredential | null,
  currentSignedVC: W3cCredential | null,
  isCurrentVCVerified: boolean,
}

interface SignedVC {
  signedVCs: GetSignedCredentialsFireBaseOutput,
  isLoadingSignedVCs: boolean
}


interface StoredVC {
  storedVCs: GetSavedCredentialsOutput,
  isLoadingStoredVCs: boolean
}

/**
 * Stateful component responsible for rendering the showcase of this app.
 * The basic parts of SSI cycle are covered with this component.
 * */
const Holder = () => {
  const [state, setState] = useState<State>({
    currentUnsignedVC: null,
    currentSignedVC: null,
    isCurrentVCVerified: false
  })

  const [signedVC, setSignedVC] = useState<SignedVC>({
    signedVCs: [],
    isLoadingSignedVCs: true
  })

  const [storeVC, setStoreVC] = useState<StoredVC>({
    storedVCs: [],
    isLoadingStoredVCs: true
  })
  
  const data = ApiService.getDidTokenToLocalStorage();
  const didToken = data? data: "Not available" // Will clean this up next time
  const firebaseService = new FireBaseService(didToken.split(';')[0]);

  /**
   * 1. Get signed VCs that are not archived from firebase.
   * 2. Get stored VCs from user cloud wallet on component mount.
   **/
  useEffect(() => {
    const getSignedVCs = async () => {
      try {
        const arrayOfSignedVCs = await firebaseService.fetchDrivingLicenseApproved();
        console.log(arrayOfSignedVCs);
        const arrayOfSignedVCsNonArchived = arrayOfSignedVCs.filter((signedVC)=>{
          return (
            (signedVC.archive===false || signedVC.hasOwnProperty('archive')===false) && (signedVC.store===false || signedVC.hasOwnProperty('store')===false)
          );
        })
        setSignedVC({
          signedVCs: [...arrayOfSignedVCsNonArchived],
          isLoadingSignedVCs: false
        })
      } catch (error) {
        FirebaseService.alertWithBrowserConsole(error.message);

        setSignedVC({
          ...signedVC,
          isLoadingSignedVCs: false
        })
      }
    }

    const getSavedVCs = async () => {
      try {
        const arrayOfStoredVCs = await ApiService.getSavedVCs();
        console.log(arrayOfStoredVCs)
        setStoreVC({
          storedVCs: [...arrayOfStoredVCs],
          isLoadingStoredVCs: false
        })
      } catch (error) {
        ApiService.alertWithBrowserConsole(error.message)

        setStoreVC({
          ...storeVC,
          isLoadingStoredVCs: false
        })
      }
    }

    getSignedVCs();
    getSavedVCs();
  }, []);

  /**
   * Function for storing a signed VC into the user cloud wallet.
   * */

  const storeSignedVC = async (index: number) => {
    try {
      const vc = signedVC.signedVCs[index].signedCredential
      
      await ApiService.storeSignedVCs({
        data: [vc]
      });

      await firebaseService.storeDrivingLicenseApproved(
        signedVC.signedVCs[index].docID
      );

      setSignedVC({
        ...signedVC,
        signedVCs: signedVC.signedVCs.filter((value, idx)=>idx !==index),
      })

      setStoreVC({
        ...storeVC,
        storedVCs: [...storeVC.storedVCs, vc]
      })

      alert('Signed VC successfully stored in your cloud wallet.');
    } catch (error) {
      ApiService.alertWithBrowserConsole(error.message);
    }
  }

  /**
   * Function for archiving a signed VC
   */

  const archiveSignedVC = async (index: number) => {
    try {
      await firebaseService.archiveDrivingLicenseApproved(signedVC.signedVCs[index].docID);
      setSignedVC({
        ...signedVC,
        signedVCs: signedVC.signedVCs.filter((value, idx)=>idx !==index),
      })

      alert('Signed VC successfully archived.');
    } catch (error) {
      FireBaseService.alertWithBrowserConsole(error.message);
    }
  }

  /**
   * Function for deleting a stored VC.
   * */
  const deleteStoredVC = async (index: number) => {
    try {
      await ApiService.deleteStoredVC(storeVC.storedVCs[index].id);

      setStoreVC({
        ...storeVC,
        storedVCs: storeVC.storedVCs.filter((value, idx) => idx !== index)
      })

      alert('Verified VC successfully deleted from your cloud wallet.');
    } catch(error) {
      ApiService.alertWithBrowserConsole(error.message)
    }
  }

  return (
    <div className='tutorial'>
      {/* <div className='tutorial__column tutorial__column--holder'>
        <h3 className='tutorial__column-title'>Holder</h3>
        <div className='tutorial__column-steps'>
          <div className='tutorial__step'> */}
            {/* <span className='tutorial__step-text'> */}
              {/* <strong>Step 3:</strong>  */}
              {/* Store signed VC
            </span> */}
          {/* </div> */}

          {/* <h5 className='font-weight-bold'>Current VC:{(!state.currentUnsignedVC && !state.currentSignedVC) && (' None')}</h5> */}

          <div className='py-3'>
            <h3>Store Signed VC</h3>
            <Table bordered>
              <thead className="thead-light">
                <tr>
                  <th>Index</th>
                  <th>ID</th>
                  <th>VC Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {signedVC.signedVCs.map((signedVCs,index)=>{
                  return (
                    <tr>
                    <th scope="row">{index+1}</th>
                    <td>{signedVCs.signedCredential.id.split(":")[1]}</td>
                    <td>{signedVCs.documentType}</td>
                    {/* <td>{signedVCs.}</td> */}
                    <td>
                      <Button variant="success" size="sm" block onClick={() => storeSignedVC(index)}>Store</Button>
                      <Button variant="warning" size="sm" block onClick={() => archiveSignedVC(index)}>Archive</Button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>

          {(state.currentUnsignedVC || state.currentSignedVC) && (
            <>
              <div>
                <span className='tutorial__status'>
                  <input
                    className='tutorial__status-input'
                    type='checkbox'
                    readOnly
                    checked={!!state.currentSignedVC}
                    id='vc-signed-checkbox'
                  />
                  <label htmlFor='vc-signed-checkbox'>Signed</label>
                </span>
                <span className='tutorial__status'>
                  <input
                    className='tutorial__status-input'
                    type='checkbox'
                    readOnly
                    checked={state.isCurrentVCVerified}
                    id='vc-verified-checkbox'
                  />
                  <label htmlFor='vc-verified-checkbox'>Verified</label>
                </span>
              </div>
              <textarea
                className='tutorial__textarea'
                readOnly
                name='credentials'
                value={JSON.stringify(state.currentSignedVC || state.currentUnsignedVC, undefined, '\t')}
              />
            </>
          )}

          <div className='py-3'>
            <h3>Stored VC</h3>
            <Table bordered>
              <thead className="thead-light">
                <tr>
                  <th>Index</th>
                  <th>ID</th>
                  <th>VC Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {storeVC.storedVCs.map((storedVCs,index)=>{
                  return (
                    <tr>
                    <th scope="row">{index+1}</th>
                    <td>{storedVCs.id.split(":")[1]}</td>
                    <td>Driving License</td>
                    <td>
                      <Button variant="danger" size="sm" block onClick={() => deleteStoredVC(index)}>Del</Button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
          
        {/* </div>
      </div> */}
    </div>
  )
}

export default Holder