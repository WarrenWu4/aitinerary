import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MdOutlineDateRange } from "react-icons/md";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';

export default function DatePicker({ date, setDate }) {
    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center gap-2">
                <MdOutlineDateRange className="text-[24px]" />
                <p className="font-[Alexandria] font-medium text-[20px] leading-[24.38px] text-gray-800">Date</p>
            </div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateRangePicker']}>
                    <DateRangePicker
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        localeText={{ start: 'Check-in', end: 'Check-out' }}
                        className="mt-1 w-full"
                        slotProps={{
                            textField: {
                                variant: "standard",
                                sx: {
                                    '& .MuiInput-underline:before': {
                                        borderBottomColor: '#E5E7EB'
                                    },
                                    '& .MuiInput-underline:hover:before': {
                                        borderBottomColor: '#9CA3AF'
                                    }
                                }
                            }
                        }}
                    />
                </DemoContainer>
            </LocalizationProvider>
        </div>
    );
}