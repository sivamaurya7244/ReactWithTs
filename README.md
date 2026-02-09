# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

```
Mere paas SQL Server mein ye tables hain:

PreparationDocumentConfiguration
PreparationDocumentFundConfiguration
PreparationDocumentConfigurationVersion

Mujhe ek stored procedure design karna hai jo FilingTransactionID ke base par 
latest entry return kare. Latest entry ka matlab hamesha 
PreparationDocumentConfigurationVersion table se highest VersionNo wala record hoga, 
aur uske saath related PreparationDocumentConfiguration aur 
PreparationDocumentFundConfiguration bhi aa jaaye.

Stored procedure ka naam usp_GetLatestPreparationDocumentConfig ho 
aur input parameter FilingTransactionID ho.


```

```
USE [TESTDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[usp_PreparationDocumentConfig]
(
    @Action NVARCHAR(20), -- 'INSERT_CONFIG', 'INSERT_FUND', 'UPDATE_FUND', 'CHANGE_STATUS', 'GET'
    @FilingTransactionID INT = NULL,
    @DocumentName NVARCHAR(200) = NULL,
    @DocumentSize INT = NULL,
    @DocumentLogoPointer NVARCHAR(200) = NULL,
    @CreatedBy INT = NULL,
    @PreparationDocumentConfigurationId INT = NULL,
    @FundID INT = NULL,
    @PreparationDocumentFundConfigurationId INT = NULL,
    @ReviewerQuery INT = NULL,
    @ApproverQuery INT = NULL,
    @Status NVARCHAR(50) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- 1. Insert into Configuration + First Version
        IF @Action = 'INSERT_CONFIG'
        BEGIN
            INSERT INTO PreparationDocumentConfiguration
            (FilingTransactionID, DocumentName, DocumentSize, DocumentLogoPointer, CreatedBy)
            VALUES (@FilingTransactionID, @DocumentName, @DocumentSize, @DocumentLogoPointer, @CreatedBy);

            SET @PreparationDocumentConfigurationId = SCOPE_IDENTITY();

            INSERT INTO PreparationDocumentConfigurationVersion
            (PreparationDocumentConfigurationId, FilingTransactionID, DocumentName, DocumentSize, DocumentLogoPointer,
             Status, VersionNo, CreatedBy, CreatedDate)
            VALUES (@PreparationDocumentConfigurationId, @FilingTransactionID, @DocumentName, @DocumentSize, @DocumentLogoPointer,
                    ISNULL(@Status,'Draft'), 1, @CreatedBy, GETDATE());

            SELECT 'Configuration & First Version Inserted Successfully' AS Message;
        END

        -- 2. Insert Fund entry
        ELSE IF @Action = 'INSERT_FUND'
        BEGIN
            INSERT INTO PreparationDocumentFundConfiguration
            (PreparationDocumentConfigurationId, FundID, CreatedBy, CreatedDate)
            VALUES (@PreparationDocumentConfigurationId, @FundID, @CreatedBy, GETDATE());

            SELECT 'Fund Entry Inserted Successfully' AS Message;
        END

        -- 3. Update Fund Reviewer/Approver
        ELSE IF @Action = 'UPDATE_FUND'
        BEGIN
            UPDATE PreparationDocumentFundConfiguration
            SET ReviewerQuery = ISNULL(@ReviewerQuery, ReviewerQuery),
                ApproverQuery = ISNULL(@ApproverQuery, ApproverQuery),
                UpdatedBy = @CreatedBy,
                UpdatedDate = GETDATE()
            WHERE PreparationDocumentFundConfigurationId = @PreparationDocumentFundConfigurationId;

            SELECT 'Fund Entry Updated Successfully' AS Message;
        END

        -- 4. Status Change → New Version
        ELSE IF @Action = 'CHANGE_STATUS'
        BEGIN
            DECLARE @CurrentVersion INT;
            SELECT @CurrentVersion = MAX(VersionNo)
            FROM PreparationDocumentConfigurationVersion
            WHERE PreparationDocumentConfigurationId = @PreparationDocumentConfigurationId;

            INSERT INTO PreparationDocumentConfigurationVersion
            (PreparationDocumentConfigurationId, FilingTransactionID, DocumentName, DocumentSize, DocumentLogoPointer,
             Status, VersionNo, CreatedBy, CreatedDate)
            SELECT PreparationDocumentConfigurationId, FilingTransactionID, DocumentName, DocumentSize, DocumentLogoPointer,
                   @Status, @CurrentVersion + 1, @CreatedBy, GETDATE()
            FROM PreparationDocumentConfiguration
            WHERE PreparationDocumentConfigurationId = @PreparationDocumentConfigurationId;

            SELECT 'New Version Inserted Successfully with Status Change' AS Message;
        END

        -- 5. Get by TransactionID
        ELSE IF @Action = 'GET'
        BEGIN
            SELECT c.*, f.*, v.*
            FROM PreparationDocumentConfiguration c
            LEFT JOIN PreparationDocumentFundConfiguration f
                ON c.PreparationDocumentConfigurationId = f.PreparationDocumentConfigurationId
            LEFT JOIN PreparationDocumentConfigurationVersion v
                ON c.PreparationDocumentConfigurationId = v.PreparationDocumentConfigurationId
            WHERE c.FilingTransactionID = @FilingTransactionID;

            SELECT 'Data Retrieved Successfully' AS Message;
        END

        ELSE
        BEGIN
            SELECT 'Invalid Action Provided' AS Message;
        END
    END TRY

    BEGIN CATCH
        SELECT 'Error: ' + ERROR_MESSAGE() AS Message;
    END CATCH
END

```
