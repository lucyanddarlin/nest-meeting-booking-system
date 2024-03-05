import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { BookingService } from './booking.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UpdateBookingDto } from './dto/update-booking.dto'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('预订模块')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}
}
