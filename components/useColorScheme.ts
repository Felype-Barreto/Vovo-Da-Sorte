// Force a consistent light theme across the app.
// This prevents the UI from switching to a black background when the device is in dark mode.
export function useColorScheme() {
	return 'light' as const;
}
