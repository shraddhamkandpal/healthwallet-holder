import React, {useState, useEffect} from 'react'
import ApiService from 'utils/apiService';
import {GetSignedCredentialsFireBaseOutput} from 'utils/firebase';
import FirebaseService from 'utils/firebaseService';



interface State {
    signedVCs: GetSignedCredentialsFireBaseOutput,
    isLoadingSignedVCs: boolean
}


const SignedVCTable = () => {
    const [state, setState] = useState<State>({
        signedVCs: [],
        isLoadingSignedVCs: true
    });

    const data = ApiService.getDidTokenToLocalStorage();
    const didToken = data? data: "Not available" // Will clean this up next time
    const firebaseService = new FirebaseService(didToken.split(';')[0]);

    useEffect(() => {
        const getSignedVCs = async () => {
            try {
              const arrayOfSignedVCs = await firebaseService.fetchDrivingLicenseApproved();
              const arrayOfSignedVCsNonArchived = arrayOfSignedVCs.filter((signedVC)=>{
                return (
                  signedVC.archive===false || signedVC.hasOwnProperty('archive')===false || signedVC.store===false || signedVC.hasOwnProperty('store')===false
                );
              })
              console.log(arrayOfSignedVCsNonArchived);
              setState({
                ...state,
                signedVCs: [...arrayOfSignedVCsNonArchived],
                isLoadingSignedVCs: false
              })
            } catch (error) {
              FirebaseService.alertWithBrowserConsole(error.message);
      
              setState({
                ...state,
                isLoadingSignedVCs: false
              })
            }
        }

        getSignedVCs();
    }, [])

    // const storeSignedVC = async (index: number) => {
    //   try {
    //     const vc = signedVC.signedVCs[index].signedCredential
        
    //     await ApiService.storeSignedVCs({
    //       data: [vc]
    //     });
  
    //     await firebaseService.storeDrivingLicenseApproved(
    //       signedVC.signedVCs[index].docID
    //     );
  
    //     setSignedVC({
    //       ...signedVC,
    //       signedVCs: signedVC.signedVCs.filter((value, idx)=>idx !==index),
    //     })
  
    //     setStoreVC({
    //       ...storeVC,
    //       storedVCs: [...storeVC.storedVCs, vc]
    //     })
  
    //     alert('Signed VC successfully stored in your cloud wallet.');
    //   } catch (error) {
    //     ApiService.alertWithBrowserConsole(error.message);
    //   }
    // }
  
    /**
     * Function for archiving a signed VC
     */
  
    // const archiveSignedVC = async (index: number) => {
    //   try {
    //     await firebaseService.archiveDrivingLicenseApproved(signedVC.signedVCs[index].docID);
    //     setSignedVC({
    //       ...signedVC,
    //       signedVCs: signedVC.signedVCs.filter((value, idx)=>idx !==index),
    //     })
  
    //     alert('Signed VC successfully archived.');
    //   } catch (error) {
    //     FireBaseService.alertWithBrowserConsole(error.message);
    //   }
    // }
}

export default SignedVCTable;