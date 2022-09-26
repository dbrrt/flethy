import {
	Box,
	ChakraProvider,
	ColorModeScript,
	extendTheme,
	useColorMode,
} from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { MobxRouter, startRouter } from 'mobx-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import events, { LogLevel } from './events/events'
import './i18n/config'
import './index.scss'
import { Provider, rootStore, useMst } from './models/root'
import routes from './routes'

export const LOGLEVEL = import.meta.env.VITE_LOGLEVEL
	? (String(import.meta.env.VITE_LOGLEVEL) as LogLevel)
	: 'off'
events.init(LOGLEVEL)

const App = observer(() => {
	const {
		root: {},
	} = useMst()

	startRouter(routes, rootStore, {
		notfound: () => rootStore.router.goTo(routes.notFound),
	})

	const theme = extendTheme({
		initialColorMode: 'light',
		useSystemColorMode: false,
		colors: {},
	})

	return (
		<ChakraProvider theme={theme}>
			{/* <Box p={4} minHeight={{ md: 'calc(100vh - 415px)' }}> */}
			<Box bg="blackAlpha.500">
				<MobxRouter store={rootStore} />
			</Box>
		</ChakraProvider>
	)
})

const container = document.getElementById('root')
if (container) {
	const root = createRoot(container)
	root.render(
		<StrictMode>
			<Provider value={rootStore}>
				<App />
			</Provider>
		</StrictMode>,
	)
}

// render(
// 	<StrictMode>
// 		<Provider value={rootStore}>
// 			<App />
// 		</Provider>
// 	</StrictMode>,
// 	document.getElementById('root'),
// )
