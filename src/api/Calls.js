import {firestore, auth, storage} from '../components/firebase/MyFirebase'
import {v4 as uuidv4} from 'uuid'
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import CryptoJS from 'crypto-js'
import NodeRSA from 'node-rsa';

export const generateUserDocument = async (user) => {
    if (!user) return;
    
    const email = user.email;
    console.log(email);
    const userRef = firestore.doc(`users/${user.uid}`);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      const email = user.email;
      console.log(email);
      try {
        await userRef.set({
          email: email,
        });
      } catch (error) {
        console.error("Error creating user document", error);
      }
    }
    return getUserDocument(user.uid);
};
  
export const saveUserKeys = async (publicKey, privEncrypt) => {
    const userRef = firestore.doc(`users/${auth.currentUser.uid}`);
    await userRef.update({
      privateKey: privEncrypt,
      publicKey: publicKey,
    });  
};
  
export const uploadFilesToDatabase = async (fileList) => {
    if (!fileList) return;
    
    
    const doc = await firestore.doc(`users/${auth.currentUser.uid}`).get();
    const pubKey = doc.data().publicKey;
    const key =  uuidv4();     
    
    
    const encryptedFiles = await encryptFiles(fileList, key);
    const encryptedKey = encryptWithPublicKey(pubKey, key);
    const userPath = `users/${auth.currentUser.uid}/files/`;
    for (let i = 0; i < encryptedFiles.length; i++){
        let fileType = encryptWithPublicKey(pubKey, fileList[i].type);
        let fileName = encryptWithPublicKey(pubKey, fileList[i].name);
        const file = encryptedFiles[i];
        let guid = uuidv4();
        let fileReference = storage.ref().child(guid);
        try {
            let path = await fileReference.put(file).then((snapshot) => {
                console.log('Uploaded file!');
                return snapshot.metadata.fullPath;
            });
            const fileRef = await firestore.doc(userPath + guid);
            await fileRef.set({
                decryptionKey: encryptedKey,
                fileLocation: path,
                fileType: fileType,
                fileName: fileName
            });
        } catch(error) {
            console.log(error);
            return;
        }
    }
};
  
const encryptWithPublicKey = (pubK, message) => {
    const key = new NodeRSA({b:512});
    key.importKey(pubK);
    return key.encrypt(message, 'base64').toString();
}
  
const decryptWithPrivateKey = (priK, message) => {
    const key = new NodeRSA({b:512});
    key.importKey(priK);
    return key.decrypt(message, 'utf8').toString();
}
  
const encryptFiles = async (fileList, key) => {
    let encryptedFileList = [];
    for (let i = 0; i < fileList.length; i++){
      const enc = await encryptFile(fileList[i], key);
      encryptedFileList.push(enc);
      
    }
    return encryptedFileList;
};
  
const encryptFile = (file, key) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            var wordArray = CryptoJS.lib.WordArray.create(reader.result);          
            var encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();        
            var fileEnc = new Blob([encrypted]);
            resolve(fileEnc);
        }
        reader.onerror = err => reject(err);
        reader.readAsArrayBuffer(file);
    });
  };
  
  
  
export const getUserFileTypesAndIds = async () => {
    let fileArr = []
    try {
        const pk = window.sessionStorage.getItem('privateKey');
        const files = await firestore.collection(`users/${auth.currentUser.uid}/files`).get().then((snapshot) => {
            snapshot.forEach((doc) => {
            const data = doc.data();
            const name = decryptWithPrivateKey(pk, data.fileName);
            const loc = data.fileLocation;
            const decryptionKey= decryptWithPrivateKey(pk, data.decryptionKey);
            console.log(decryptionKey);
            const type = decryptWithPrivateKey(pk, data.fileType);
            fileArr.push({
                decryptionKey: decryptionKey,
                fileLocation: loc,
                fileType: type,
                fileName: name,
            });
          });
      });
      return fileArr;
    } catch (error) {
      console.error("Error fetching user", error);
    }
}
  
export const getUserPrivateKeyAndDecrypt = async (password) => {
    try {
        const doc = await firestore.doc(`users/${auth.currentUser.uid}`).get();
        const bytes = AES.decrypt(doc.data().privateKey, password);
        const pk = bytes.toString(Utf8);
        window.sessionStorage.setItem('privateKey', pk);
        console.log(pk);
    } catch (error) {
        console.error("Error fetching user", error);
    }
}
  
const getUserDocument = async uid => {
    if (!uid) return null;
    try {
        const userDocument = await firestore.doc(`users/${uid}`).get();
        return {
            uid,
            ...userDocument.data()
        };
    } catch (error) {
      console.error("Error fetching user", error);
    }
};
  
export const getFile = async (filePath, decryptionKey, type) => {
    const pathRef = storage.ref(filePath);
    let url = await pathRef.getDownloadURL();
    let data = await fetch(url);
  
    let blob = await data.blob();
    
    return await decryptFile(blob, decryptionKey, type);
};
  
  
const decryptFile = (file, key, type) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            console.log(reader.result)
            var decrypted = CryptoJS.AES.decrypt(reader.result, key);     
            var typedArray = convertWordArrayToUint8Array(decrypted);
            var fileEnc = new Blob([typedArray], {type: type});
            resolve(fileEnc);
        }
        reader.onerror = err => reject(err);
        reader.readAsText(file);
    });
};
  
const convertWordArrayToUint8Array = (wordArray) => {
    var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
    var length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
    var uInt8Array = new Uint8Array(length), index=0, word, i;
    for (i=0; i<length; i++) {
        word = arrayOfWords[i];
        uInt8Array[index++] = word >> 24;
        uInt8Array[index++] = (word >> 16) & 0xff;
        uInt8Array[index++] = (word >> 8) & 0xff;
        uInt8Array[index++] = word & 0xff;
    }
    return uInt8Array;
}

export const deleteFile = async (fileId) => {
    try{
        const fileRef = storage.ref(fileId);
        fileRef.delete().then(async () => {
            await firestore.doc(`users/${auth.currentUser.uid}/files/${fileId}`).delete();
        })
    }
    catch(error) {
        console.error(error);
    }
    
}

const getUserEmail = async (userId) => {
    const userRef = firestore.doc(`users/${userId}`);
    return (await userRef.get()).data().email;
}

export const addToGroup = async (userId, groupId) => {
    const groupRef = firestore.doc(`groups/${groupId}/users/${userId}`);
    const email = await getUserEmail(userId);
    await groupRef.set({
        userId: userId,
        userEmail: email
    });

    const userGroupRef = firestore.doc(`users/${userId}/groups/${groupId}`);
    await userGroupRef.set({
        groupId: groupId
    })
    const doc = await firestore.doc(`users/${userId}`).get();
    const pubKey = doc.data().publicKey;
    let groupFiles = await getGroupFiles(groupId);
    for (let i = 0; i < groupFiles.length; i++){
        
        const userPath = `users/${userId}/groups/${groupId}/files/`;
        const fileRef = firestore.doc(userPath + groupFiles[i].fileLocation);
        await fileRef.set({
            decryptionKey: encryptWithPublicKey(pubKey, groupFiles[i].decryptionKey),
            fileLocation: groupFiles[i].fileLocation,
            fileType: encryptWithPublicKey(pubKey, groupFiles[i].fileType),
            fileName: encryptWithPublicKey(pubKey, groupFiles[i].fileName),
        });
    }
}

export const addToGroupEmail = async (userEmail, groupId) => {
    await firestore.collection(`users`).get().then((snapshot) => {
        snapshot.forEach(async (doc) => {
            console.log(doc.data().email);
            if (doc.data().email === userEmail){
                await addToGroup(doc.id, groupId);
                return;
            }
        });
    });
}


export const createGroup = async (groupName) => {
    let groupId = uuidv4();
    const groupRef = firestore.doc(`groups/${groupId}`);
    // Creating Group
    await groupRef.set({
        groupName: groupName,
        groupId: groupId,
    });
    // Adding initial user to group
    await addToGroup(auth.currentUser.uid, groupId);
}

export const getMyGroups = async () => {
    let groupIds = [];
    let tempCollections = [];
    await firestore.collection(`users/${auth.currentUser.uid}/groups`).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            tempCollections.push(doc.data());
        });
    });

    for (const collection of tempCollections) {
        const groupId = collection.groupId;
        const groupName = await getGroupName(groupId);
        groupIds.push({
            groupName: groupName,
            groupId: groupId
        });
    }
    return groupIds;
}

export const getGroupName = async (groupId) => {
    const groupRef = firestore.doc(`groups/${groupId}`);
    return (await groupRef.get()).data().groupName;
}

export const uploadFilesToGroup = async (groupId, fileList) => {
    if (!fileList) return;
    try {
        let userIds = []
        const groupUsersRef = firestore.collection(`groups/${groupId}/users`);
        await groupUsersRef.get().then((snapshot) => {
            snapshot.forEach((doc) => {
                userIds.push(doc.data().userId);
            });
        })

        
        let fileData = [];
        const key =  uuidv4();     
        const encryptedFiles = await encryptFiles(fileList, key);
        for (let i = 0; i < encryptedFiles.length; i++){
            let fileType = fileList[i].type;
            let fileName = fileList[i].name;
            const file = encryptedFiles[i];
            let guid = uuidv4();
            let fileReference = storage.ref().child(guid);
            let path = await fileReference.put(file).then((snapshot) => {
                console.log('Uploaded file!');
                return snapshot.metadata.fullPath;
            });

            fileData.push({
                fileType: fileType,
                fileName: fileName,
                fileLocation: path
            })
        }

        console.log(fileData.length);
        console.log(userIds.length);

        for (let i = 0; i < fileData.length; i++){
            for(let j = 0; j < userIds.length; j++) {
                const doc = await firestore.doc(`users/${userIds[j]}`).get();
                const pubKey = doc.data().publicKey;
                const fileType = encryptWithPublicKey(pubKey, fileData[i].fileType);
                const fileName = encryptWithPublicKey(pubKey, fileData[i].fileName);
                const encryptedKey = encryptWithPublicKey(pubKey, key);
                const userPath = `users/${userIds[j]}/groups/${groupId}/files/`;
                const fileRef = firestore.doc(userPath + fileData[i].fileLocation);
                await fileRef.set({
                    decryptionKey: encryptedKey,
                    fileLocation: fileData[i].fileLocation,
                    fileType: fileType,
                    fileName: fileName
                });
                console.log(fileData[i]);

            }
        }

    }
    catch(error){
        console.error(error);
    }
    
}

export const getGroupFiles = async (groupId) => {
    let fileArr = []
    try {
        const pk = window.sessionStorage.getItem('privateKey');
        const files = await firestore.collection(`users/${auth.currentUser.uid}/groups/${groupId}/files`).get().then((snapshot) => {
            snapshot.forEach((doc) => {
            const data = doc.data();
            const name = decryptWithPrivateKey(pk, data.fileName);
            const loc = data.fileLocation;
            const decryptionKey= decryptWithPrivateKey(pk, data.decryptionKey);
            console.log(decryptionKey);
            const type = decryptWithPrivateKey(pk, data.fileType);
            fileArr.push({
                decryptionKey: decryptionKey,
                fileLocation: loc,
                fileType: type,
                fileName: name,
            });
          });
      });
      return fileArr;
    } catch (error) {
      console.error("Error fetching user", error);
    }
    return [];
}

export const removeUserFromGroup = async (userId, groupId) => {
    const groupRef = firestore.doc(`groups/${groupId}/users/${userId}`);
    await groupRef.delete();

    const userGroupRef = firestore.doc(`users/${userId}/groups/${groupId}`);
    await userGroupRef.delete();

}

export const removeFromGroupEmail = async (userEmail, groupId) => {
    await firestore.collection(`users`).get().then((snapshot) => {
        snapshot.forEach(async (doc) => {
            console.log(doc.data().email);
            if (doc.data().email === userEmail){
                await removeUserFromGroup(doc.id, groupId);
                return;
            }
        });
    });
}