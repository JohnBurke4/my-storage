#

# **CSU34031 Advanced Telecommunications**

## **Secure Cloud Storage - John Burke - 18326420**

The repository for this project can be found at [https://github.com/JohnBurke4/my-storage](https://github.com/JohnBurke4/my-storage) and a live deployment can be found at [https://my-storage.vercel.app/](https://my-storage.vercel.app/).

### **Task**

The aim of this project is to develop a secure cloud storage application for Dropbox, Box, Google Drive, Office365 etc. For example, your application will secure all files that are uploaded to the cloud, such that only people that are part of your &quot;Secure Cloud Storage Group&quot; will be able to decrypt uploaded files. Any member of the group should be able to upload encrypted files to the cloud service. To all other users the files will be encrypted.

You are required to design and implement a suitable **key management** system for your application which employs **public-key certificates** that allows users of the system to **share files securely** , and also allows one to **add or remove users** from the group. You are free to implement your application for a desktop or mobile platform and make use of any open source cryptographic libraries.

### **Approach Overview**

My application consists of a React Javascript frontend supported by a Google Firebase backend. Firebase provided secure user authentification through firebase auth, file storage with firebase storage and a document-led database with firestore.

All cryptographic functions were gotten through the Crypto-JS and Node-AES libraries.

### **Application Overview**

### **Key Management**

### \*\*File Encryption

### **Group Function**

### **Code**

The code itself is too long to add to this PDF. It can all be found on my Github at [https://github.com/JohnBurke4/my-storage](https://github.com/JohnBurke4/my-storage). Similarly a live version of the web app can be found at [https://my-storage.vercel.app/](https://my-storage.vercel.app/).
