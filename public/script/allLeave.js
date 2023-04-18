const updateRequest = async (_id, _action)=>{
    const id = _id
    const action = _action
    const data = await fetch(`/admin/api/leave`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        action
      })
    })
    const result = await data.json()
    console.log(result)
  }