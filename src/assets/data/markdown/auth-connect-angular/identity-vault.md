# Integrate Ionic's Identity Vault

Three options for storage of the keys:

- Default
  - uses local storage
  - not a good option for on device storage
  - meant to facilitate development
  - **do not use in production**
- Create your own `TokenStorageProvider`
  - create a service that implements `TokenStorageProvider`
  - you have to do the heavy lifting yourself
  - ultimate flexibility
- Use Ionic's Identity Vault
  - most secure option
  - minimal amount of work
  - **this is the preferred option**

## The Vault Service
