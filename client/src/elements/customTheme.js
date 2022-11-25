import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
    palette: {
		primary: {
			main: '#335f5e',
			light: '#dffeff',
			dark: '#004242',
		}
        
	},
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                    borderColor: '#000000'
                    }
                }
                }
            }
        }
    }
});

export default customTheme;

