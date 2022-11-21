class MockSplashScreen {
  async hide(): Promise<void> {}
  async show(): Promise<void> {}
}

const SplashScreen = new MockSplashScreen();

export { SplashScreen };
