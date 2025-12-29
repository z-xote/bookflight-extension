- fix bookflight profile (plane logo)                                         [crox] 
- edit previous message                                                       [crox] 


- populate prompt with client data                                            [tick]
- get a prototype version of prompt                                           [tick]
- settings button on form page                                                [tick]
- 3 dots, vertial, right of send button - access to tools modual              [tick]



---




basically make a tools modual as well as one for settings.

---

first off, we have to create a prompt that will understand the intent of our 
extension. 

we should probably talk about the 5 stages to complete a PNR, as well as create
a format for client details that can be sent to the ai, upon which guide mode is turned on. 

---

okay, so guide mode & chat mode. 

we should create prompts for these 2, and depending on the trigger (the form format in user prompt)


---

if form is present: switch to guide mode.

- lock "start booking" with required fields
- allow to send form with "skip to chat" - but notify ai. 

basically, moral of the story, notify ai about what the user clicked as well as the form. 

---

fomrat:

```form
submission_type: (skipped form | filled form),
passengers: [
  "Mr. Arun Kumar",
  "Mrs. Kriti Lata"
],
contact_info: {
  "email": "bookflightfiji@gmail.com",
  "phone": "+679 9274730"
}
travel_details: {
  "origin": "",
  "destination": "",
  "departure": "",
  "arrival": "",
  "trip_type": "",
}
```

version 1.0.8: populate prompt with client data.

--- 

the issue with codeblock is that we're not having the copy button stick to top right. when sliding, it sort of goes into the middle, as seen in the screenshot.then i also do not want a slider visible in the codeblock. 

to fix this we can remove slider from div, and push the copy button either above the sliding div or use some z-index magic. 

but what files to give ai? 