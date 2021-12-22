class MockFirebaseAnalytics {
  async initializeFirebase(opt: any): Promise<void> {}
  async logEvent(opt: any): Promise<void> {}
}

const FirebaseAnalytics = new MockFirebaseAnalytics();

export { FirebaseAnalytics };
