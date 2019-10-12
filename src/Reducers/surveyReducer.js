const surveyInitialState = {
  action: ''
}

const surveys = (state = surveyInitialState, action) => {
  switch (action.type) {
    case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
    case "All_SURVEYS":
      return {
        ...state,
        data: action.payload,
        action:'All_SURVEYS'
      }
      case "SURVEYS_LIST":
        return {
          ...state,
          data: action.payload,
          action:'SURVEYS_LIST'
        }
        case "SURVEYS_LIST_QUESTIONS":
          return {
            ...state,
            data: action.payload,
            action:'SURVEYS_LIST_QUESTIONS'
          }
          case "SURVEYS_LISTING":
            return {
              ...state,
              data: action.payload,
              action:'SURVEYS_LISTING'
            }
            case "SORT_ORDER_UPDATE_SURVEY":
              return {
                ...state,
                data: action.payload,
                action:'SORT_ORDER_UPDATE_SURVEY'
              }
        case "SURVEY_TEMPLATE_DATA":
        {
          return { ...state, data: action.payload, action:'SURVEY_TEMPLATE_DATA' }
        }
        case "SAVE_SURVEY_TEMPLATE_DATA":
        {
          return { ...state, data: action.payload, action:'SAVE_SURVEY_TEMPLATE_DATA' }
        }
        case "DELETE_SURVEY_TEMPLATE":
        {
          return { ...state, data: action.payload, action:'DELETE_SURVEY_TEMPLATE' }
        }
        case "SURVEY_PUBLISH_STATUS":
        {
          return { ...state, data: action.payload, action:'SURVEY_PUBLISH_STATUS' }
        }

    default:
      return state
  }
}

export default surveys;
