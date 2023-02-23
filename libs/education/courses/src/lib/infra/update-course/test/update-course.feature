Feature: Update Course

Scenario: Successfully updating a course
  Given the request is valid
  And the course exists in the repository
  When I attempt to update a course
  Then an existing record should have been updated in the repository
  And saved course is returned within payload

# Scenario: Fail; Group does not exist
#   Given the request is valid
#   And the course does not exist in the repository
#   When I attempt to update a course
#   Then I should receive a RepositoryItemNotFoundError

# TODO - no change

# TODO - requestSource paths

# TODO - needs to be RE-implemented
# Scenario: Fail; Invalid request
#   Given the request contains invalid data
#   When I attempt to create a course
#   Then I should receive a RequestInvalidError

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during course creation
#   When I attempt to create a course
#   Then I should receive an error
