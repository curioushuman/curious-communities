Feature: Find CourseSource

Scenario: Successfully finding a course-source by Source Id
  Given the request is valid
  When I attempt to find a course-source
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a course-source
  Then I should receive a RequestInvalidError
