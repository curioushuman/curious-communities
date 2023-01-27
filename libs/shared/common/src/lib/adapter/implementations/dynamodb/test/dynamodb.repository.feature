Feature: DynamoDb Repository

Scenario: Successful instantiation of DynamoDb Repository
  Given I have provide valid DynamoDb repository configuration
  When I instantiate the repository
  Then I should receive a valid repository instance
