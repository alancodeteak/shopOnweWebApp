import React, { useState, useRef } from 'react';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

export default function CalendarDatePicker({ value, onChange, label, min, max, disabled }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDateChange = (newValue) => {
    handleClose();
    if (onChange) {
      onChange(dayjs(newValue).format('YYYY-MM-DD'));
    }
  };

  return (
    <>
      <TextField
        inputRef={inputRef}
        label={label}
        value={value || ''}
        onClick={handleOpen}
        onChange={() => {}}
        fullWidth
        size="small"
        margin="none"
        disabled={disabled}
        InputProps={{
          readOnly: true,
          style: { cursor: disabled ? 'not-allowed' : 'pointer', background: disabled ? '#f3f4f6' : '#fff' },
        }}
        sx={{ minWidth: 0 }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 1 } }}
      >
        <DateCalendar
          value={value ? dayjs(value) : null}
          onChange={handleDateChange}
          minDate={min ? dayjs(min) : undefined}
          maxDate={max ? dayjs(max) : undefined}
          disabled={disabled}
        />
      </Popover>
    </>
  );
}