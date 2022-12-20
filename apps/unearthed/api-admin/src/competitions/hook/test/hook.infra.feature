Feature: External event hook to internal event

Scenario: Successfully creating a valid internal event
  Given a valid external event has occurred
  When a request including this data has been sent to the hook endpoint
  Then a successful response should be returned
  # And an internal event is created
  # And an event ID is returned
