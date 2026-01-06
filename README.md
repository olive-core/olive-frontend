# Olive Frontend

### Run Locally

### Build for Production
- `nvm use 24.10.0`
- `cp .env.example .env`
- `npm run build`


### DISCUSS
- patient (or, user info) needs a column named sex
- CORS
- might need an api to resend api
- need an api to find patient by phone number (may not exist)
- we should not send otp to a phone if it is not clinician. before we send otp, create a clinician if does not exist
- 


### API Issues
- `/api/v1/patient/{user_id}`:  this api should return patient name, age etc so that we can show patient info card for doctor
- `/api/v1/patient/{user_id}`: should receive name, age or dob (decide?), sex (similar payload as by-clinician) to edit patient.
- need an API to get medicine list based on query (or, if there is less medicines, can be handled in frontend)


### Notes
**Chief Complaint**
- duration
- note
- name

**history**
- duration
- notes
- name

**diagnosis**
- diagnosis name

**investigation**
- name
- status
- result link

**medicine**
- name (company)
- dosage
- routine
    - before_breakfast, after_breakfast, before_lunch, after_lunch, before_dinner, after_dinner, gap_hour

**advice**
- body text

**follow up**
