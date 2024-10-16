import React, { useState } from 'react'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type ScheduledPublishTimeCellProps = {
  lens: {
    id: number;
    scheduledPublishTime: string | null;
  };
  handleSchedulePublishTime: (id: number, date: Date | undefined) => void;
}

export function ScheduledPublishTimeCell({ lens, handleSchedulePublishTime }: ScheduledPublishTimeCellProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    lens.scheduledPublishTime ? new Date(lens.scheduledPublishTime) : undefined
  );
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [hour, setHour] = useState<string | undefined>(
    selectedDate ? format(selectedDate, 'hh') : undefined
  );
  const [minute, setMinute] = useState<string | undefined>(
    selectedDate ? format(selectedDate, 'mm') : undefined
  );
  const [ampm, setAmpm] = useState<string | undefined>(
    selectedDate ? format(selectedDate, 'a') : undefined
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const currentDate = selectedDate || new Date()
      newDate.setHours(currentDate.getHours())
      newDate.setMinutes(currentDate.getMinutes())
    }
    setSelectedDate(newDate)
  }

  const handleTimeChange = (type: 'hour' | 'minute' | 'ampm', value: string) => {
    if (!selectedDate) {
      setSelectedDate(new Date())
    }
    
    let newDate = new Date(selectedDate || new Date())
    
    if (type === 'hour') {
      setHour(value)
      let hourInt = parseInt(value)
      if (ampm === 'PM' && hourInt !== 12) hourInt += 12
      if (ampm === 'AM' && hourInt === 12) hourInt = 0
      newDate.setHours(hourInt)
    } else if (type === 'minute') {
      setMinute(value)
      newDate.setMinutes(parseInt(value))
    } else if (type === 'ampm') {
      setAmpm(value)
      let hourInt = newDate.getHours()
      if (value === 'PM' && hourInt < 12) hourInt += 12
      if (value === 'AM' && hourInt >= 12) hourInt -= 12
      newDate.setHours(hourInt)
    }
    
    setSelectedDate(newDate)
  }

  const handleSaveDateTime = () => {
    if (!selectedDate || !hour || !minute || !ampm) {
      toast({
        title: "Incomplete Selection",
        description: "Please select all date and time values.",
        variant: "destructive",
      });
      return;
    }

    handleSchedulePublishTime(lens.id, selectedDate)
    setIsPopoverOpen(false)
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP hh:mm a") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="p-3 border-t">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
            >
              <Clock className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'hh:mm a') : 'Select time'}
            </Button>
          </div>
          {isTimePickerOpen && (
            <div className="flex justify-between mt-2">
              <Select
                value={hour}
                onValueChange={(value) => handleTimeChange('hour', value)}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={(i + 1).toString().padStart(2, '0')}>
                      {(i + 1).toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={minute}
                onValueChange={(value) => handleTimeChange('minute', value)}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={ampm}
                onValueChange={(value) => handleTimeChange('ampm', value)}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button className="mt-4 w-full" onClick={handleSaveDateTime}>
            Save Date and Time
          </Button>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedDate(undefined)
              setHour(undefined)
              setMinute(undefined)
              setAmpm(undefined)
              handleSchedulePublishTime(lens.id, undefined)
              setIsPopoverOpen(false)
            }}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}