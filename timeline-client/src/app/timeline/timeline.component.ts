import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ServerService } from '../server.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  form: FormGroup;
  modalRef: BsModalRef;

  events: any[] = [];
  currentEvent: any = {id: null, name: '', description: '', date: new Date()};
  modalCallback: () => void;

  constructor(private fb: FormBuilder,
              private modalService: BsModalService,
              private server: ServerService) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.currentEvent.name, Validators.required],
      description: this.currentEvent.description,
      date: [this.currentEvent.date, Validators.required],
    });
    this.getEvents();
  }

  private updateForm() {
    this.form.setValue({
      name: this.currentEvent.name,
      description: this.currentEvent.description,
      date: new Date(this.currentEvent.date)
    });
  }

  private getEvents() {
    this.server.getEvents().then((response: any) => {
      console.log('Response', response);
      this.events = response.map((ev) => {
        ev.body = ev.description;
        ev.header = ev.name;
        ev.icon = 'fa-clock-o';
        return ev;
      });
    });
  }

  addEvent(template) {
    this.currentEvent = {id: null, name: '', description: '', date: new Date()};
    this.updateForm();
    this.modalCallback = this.createEvent.bind(this);
    this.modalRef = this.modalService.show(template);
  }

  createEvent() {
    const newEvent = {
      name: this.form.get('name').value,
      description: this.form.get('description').value,
      date: this.form.get('date').value,
    };
    this.modalRef.hide();
    this.server.createEvent(newEvent).then(() => {
      this.getEvents();
    });
  }

  editEvent(index, template) {
    this.currentEvent = this.events[index];
    this.updateForm();
    this.modalCallback = this.updateEvent.bind(this);
    this.modalRef = this.modalService.show(template);
  }

  updateEvent() {
    const eventData = {
      id: this.currentEvent.id,
      name: this.form.get('name').value,
      description: this.form.get('description').value,
      date: this.form.get('date').value,
    };
    this.modalRef.hide();
    this.server.updateEvent(eventData).then(() => {
      this.getEvents();
    });
  }

  deleteEvent(index) {
    this.server.deleteEvent(this.events[index]).then(() => {
      this.getEvents();
    });
  }

  onCancel() {
    this.modalRef.hide();
  }
}
