import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DislikeText {
  _id: string
  title: string
  description: string
  options: string[]
}


interface ModelDropdownProps {
  onSelect: (option: string) => void
}

interface AddFreeSubscriptionUserModalProps {
  users: { _id: string; userName: string }[];
  selectedUsers: { _id: string; userName: string }[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<{ _id: string; userName: string }[]>>;
}

interface PromptAPIResponse {
  message: string;
  data: {
    _id: string;
    prompt: string;
    systemPrompt: string;
    generalSystemPrompt: string;
  };
}

interface NegativeKeyword {
  _id?: string;
  negativeKeyword: string;
}

interface NegativeKeywordAPIResponse {
  message: string;
  data: NegativeKeywordData[];
}

interface NegativeKeywordData {
  _id: string;
  negativeKeyword: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface FirebaseUserAPIResponse {
  message: string;
  data: {
    _id: string;
    freeMultiImage: string;
    freeUserLimit: string;
    proMultiImage: string;
    proUerLimit: string;
    isLive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    civitaiAPIKey: string;
    freeTryLimit: string;
    proUserExtraCredit: string;
    productionUrl: string;
    stageUrl: string;
  };
}

interface AddCommentModalProps {
  creatorTitle: string;
  setCreatorTitle: React.Dispatch<React.SetStateAction<string>>;
  viewerTitle: string;
  setViewerTitle: React.Dispatch<React.SetStateAction<string>>;
}

const AddModelCommentModal: React.FC<AddCommentModalProps> = ({
  creatorTitle,
  setCreatorTitle,
  viewerTitle,
  setViewerTitle,
}) => (
  <div className="grid gap-4">
    <div>
      <h3 className='mb-1 bols'>Creator</h3>
      <Label htmlFor="creator-title">Title</Label>
      <Input
        id="creator-title"
        value={creatorTitle}
        onChange={(e) => setCreatorTitle(e.target.value)}
        placeholder="Enter Title"
      />
    </div>
    <div>
      <h3 className='mb-1 bols'>Viewer</h3>
      <Label htmlFor="viewer-title">Title</Label>
       <Input
        id="viewer-title"
        value={viewerTitle}
        onChange={(e) => setViewerTitle(e.target.value)}
        placeholder="Enter Title"
      />
    </div>
  </div>
);

// Define modal components outside of ModelDropdown

interface NegativeKeywordsModalProps {
  negativeKeywords: NegativeKeyword[];
  currentKeyword: string;
  setCurrentKeyword: React.Dispatch<React.SetStateAction<string>>;
  addKeyword: () => void;
  removeKeyword: (index: number) => void;
  updateKeyword: (index: number, newValue: string) => void;
}

const NegativeKeywordsModal: React.FC<NegativeKeywordsModalProps> = ({
  negativeKeywords,
  currentKeyword,
  setCurrentKeyword,
  addKeyword,
  removeKeyword,
  updateKeyword,
}) => (
  <div className="grid gap-4">
    {negativeKeywords.map((keywordObj, index) => (
      <div key={keywordObj._id || index} className="flex items-center justify-between">
        <div className="flex-1">
          <Input
            value={keywordObj.negativeKeyword}
            onChange={(e) => updateKeyword(index, e.target.value)}
          />
        </div>
        <Button onClick={() => removeKeyword(index)} variant="destructive" size="sm" className='ml-1'>
          Remove
        </Button>
      </div>
    ))}
    <div className="flex items-center gap-2">
      <Input
        value={currentKeyword}
        onChange={(e) => setCurrentKeyword(e.target.value)}
        placeholder="Enter keyword"
        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
      />
      <Button onClick={addKeyword}>Add</Button>
    </div>
  </div>
);


interface SystemPromptModalProps {
  systemPrompt: string;
  setSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  systemPrompt,
  setSystemPrompt,
}) => (
  <div className="grid gap-4">
    <Textarea
      value={systemPrompt}
      onChange={(e) => setSystemPrompt(e.target.value)}
      placeholder="Enter system prompt"
      className="min-h-[200px]"
    />
  </div>
);

interface RemixPromptModalProps {
  remixPrompt: string;
  setRemixPrompt: React.Dispatch<React.SetStateAction<string>>;
  remixSystemPrompt: string;
  setRemixSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
}

const RemixPromptModal: React.FC<RemixPromptModalProps> = ({
  remixPrompt,
  setRemixPrompt,
  remixSystemPrompt,
  setRemixSystemPrompt,
}) => (
  <div className="grid gap-4">
    <Label className="text-left w-100">
      Remix Prompt
    </Label>
    <Textarea
      value={remixPrompt}
      onChange={(e) => setRemixPrompt(e.target.value)}
      placeholder="Enter remix prompt"
      className="min-h-[150px]"
    />
    <Label className="text-left w-100">
      Remix System Prompt
    </Label>
    <Textarea
      value={remixSystemPrompt}
      onChange={(e) => setRemixSystemPrompt(e.target.value)}
      placeholder="Enter remix system prompt"
      className="min-h-[150px]"
    />
  </div>
);

interface TestingValuesModalProps {
  testingValues: {
    [key: string]: string;
  };
  handleTestingValueChange: (key: string, value: string) => void;
}

const TestingValuesModal: React.FC<TestingValuesModalProps> = ({
  testingValues,
  handleTestingValueChange,
}) => (
  <div className="grid gap-4">
    {Object.entries(testingValues).map(([key, value]) => (
      <div key={key} className="grid grid-cols-2 items-center gap-4">
        <Label htmlFor={key}>{key}</Label>
        {key === 'isLive' ? (
          <Select value={value} onValueChange={(val) => handleTestingValueChange(key, val)}>
            <SelectTrigger id={key}>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={key}
            value={value}
            onChange={(e) => handleTestingValueChange(key, e.target.value)}
          />
        )}
      </div>
    ))}
  </div>
);

const AddFreeSubscriptionUserModal: React.FC<AddFreeSubscriptionUserModalProps> = ({
  users,
  selectedUsers,
  setSelectedUsers,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [freeUsers, setFreeUsers] = useState<any[]>([]); 
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreeUsers = async () => {
      try {
        const response = await axios.get('https://dashboard.flashailens.com/api/dashboard/getFreeUser');
        setFreeUsers(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error('Error fetching free users:', error);
      }
    };
  
    fetchFreeUsers();
  }, []);
  
  const removeUser = async (id: string) => {
    console.log('Removing user with ID:', id);
    const updatedSelectedUsers = selectedUsers.filter(user => user._id !== id);
    setSelectedUsers(updatedSelectedUsers);
    setRemovingUserId(id); 
    try {
      const response = await axios.delete(`https://dashboard.flashailens.com/api/dashboard/deleteFreeUser/${id}`);
      if (response.status !== 200) {
        setSelectedUsers(selectedUsers); 
        setRemovingUserId(null);
        console.error('Failed to remove user:', response.data); 
      } else {
        console.log('User removed successfully');
        setRemovingUserId(null);
      }
    } catch (error) {
      setSelectedUsers(selectedUsers); 
      setRemovingUserId(null); 
      console.error('Error removing user:', error);
      console.error('User with ID:', id, 'was not removed'); 
    }
  };
  
  const handleRemoveFreeUser = (userId: string) => {
    removeUser(userId); 
  };

  const handleUserSelect = async (value: string) => {
    setSelectedUserId(value);
    const userToAdd = users.find(user => user._id === value); // Updated to find user in all users
    if (userToAdd && !selectedUsers.some(u => u._id === userToAdd._id)) {
      setSelectedUsers([...selectedUsers, userToAdd]);
      
      // Send selected user data to the API
      await axios.post('https://dashboard.flashailens.com/api/dashboard/addFreeUser', {
        models : [{ _id: "", userName: userToAdd.userName }]
      });
    }
    setSelectedUserId(''); // Reset the selection
  };

  return (
    <div className="grid gap-4">
      <Select
        value={selectedUserId}
        onValueChange={handleUserSelect} // Updated to use the new handler
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a user" />
        </SelectTrigger>
        <SelectContent>
          {users.map(user => ( // Display all users in the select list
            <SelectItem key={user._id} value={user._id}>
              {user.userName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className=''>
        <h4 className='mb-1'>Free Users:</h4> {/* Added header for free users */}
        {freeUsers.map(user => ( // Display free users below the select list
          <div key={user._id} className="flex items-center justify-between margin-10">
            <span className='rounded-md mobile-100 w-[90%] d-block'>{user.userName}</span>
            <Button
              onClick={() => removeUser(user._id)}
              variant="destructive"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
        {selectedUsers.map(user => (
          <div key={user._id} className="flex items-center justify-between margin-10">
            <span className='rounded-md mobile-100 w-[90%] d-block'>{user.userName}</span>
            <Button
              onClick={() => removeUser(user._id)}
              variant="destructive"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SocialFeedAlgorithm {
  latestPost: number
  highScorePost: number
  likeScore: number
  dislikeScore: number
  commentScore: number
  reGenScore: number
  remixScore: number
}

export function ModelDropdown({ onSelect }: ModelDropdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeyword[]>([])
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [remixPrompt, setRemixPrompt] = useState('')
  const [remixSystemPrompt, setRemixSystemPrompt] = useState('')
  const [testingValues, setTestingValues] = useState({
    freeMultiImage: '',
    freeUserLimit: '',
    freeTryLimit: '',
    proMultiImage: '',
    proUerLimit: '',
    proUserExtraCredit: '',
    civitaiAPIKey: '',
    productionUrl: '',
    stageUrl: '',
    isLive: 'true'
  })
  const [users, setUsers] = useState<{ _id: string; userName: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ _id: string; userName: string }[]>([]);
  const [creatorTitle, setCreatorTitle] = useState('');
  const [viewerTitle, setViewerTitle] = useState('');

  const [dislikeText, setDislikeText] = useState<DislikeText>({
    _id: '',
    title: '',
    description: '',
    options: []
  })

  const [socialFeedAlgorithm, setSocialFeedAlgorithm] = useState<SocialFeedAlgorithm>({
    latestPost: 70,
    highScorePost: 30,
    likeScore: 2,
    dislikeScore: 1,
    commentScore: 1,
    reGenScore: 3,
    remixScore: 1
  })

  useEffect(() => {
    const fetchPromptData = async () => {
      try {
        const response = await fetch('https://dashboard.flashailens.com/api/dashboard/getPromptValue');
        const data: PromptAPIResponse = await response.json();
        setSystemPrompt(data.data.generalSystemPrompt);
        setRemixPrompt(data.data.prompt);
        setRemixSystemPrompt(data.data.systemPrompt);
      } catch (error) {
        console.error('Error fetching prompt data:', error);
      }
    };

    const fetchNegativeKeywords = async () => {
      try {
        const response = await fetch('https://dashboard.flashailens.com/api/dashboard/getNegativeKeywords');
        const data: NegativeKeywordAPIResponse = await response.json();
        // Store both _id and negativeKeyword
        setNegativeKeywords(data.data.map(item => ({
          _id: item._id,
          negativeKeyword: item.negativeKeyword
        })));
      } catch (error) {
        console.error('Error fetching negative keywords:', error);
      }
    };

    const fetchFirebaseUserData = async () => {
      try {
        const response = await fetch('https://dashboard.flashailens.com/api/dashboard/getFirebaseUser');
        const data: FirebaseUserAPIResponse = await response.json();
        setTestingValues({
          freeMultiImage: data.data.freeMultiImage,
          freeUserLimit: data.data.freeUserLimit,
          freeTryLimit: data.data.freeTryLimit,
          proMultiImage: data.data.proMultiImage,
          proUerLimit: data.data.proUerLimit,
          proUserExtraCredit: data.data.proUserExtraCredit,
          civitaiAPIKey: data.data.civitaiAPIKey,
          productionUrl: data.data.productionUrl,
          stageUrl: data.data.stageUrl,
          isLive: data.data.isLive ? 'true' : 'false'
        });
      } catch (error) {
        console.error('Error fetching Firebase user data:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('https://dashboard.flashailens.com/api/dashboard/getUsers');
          const data: FirebaseUserAPIResponse = await response.json();
          setUsers(Array.isArray(data.data) ? data.data.map((user: { _id: string; userName: string }) => ({ _id: user._id, userName: user.userName })) : []);
        } catch (error) {
          console.error('Error fetching users:', error);
      };
    }

    const fetchCommentTitles = async () => {
      try {
        const response = await fetch('https://dashboard.flashailens.com/api/dashboard/getCommentTitles');
        const data = await response.json();
        setCreatorTitle(data.data.creatorTitle);
        setViewerTitle(data.data.viewerTitle);
      } catch (error) {
        console.error('Error fetching comment titles:', error);
      }
    };

    const fetchDislikeText = async () => {
      try {
        const response = await axios.get('https://dashboard.flashailens.com/api/dashboard/getDislikeTexts')
        setDislikeText(response.data.data)
      } catch (error) {
        console.error('Error fetching dislike text:', error)
      }
    }

    const fetchSocialFeedAlgorithm = async () => {
      try {
        const response = await axios.get('https://dashboard.flashailens.com/api/dashboard/getSocialAlgorithmData')
        setSocialFeedAlgorithm(response.data.data)
      } catch (error) {
        console.error('Error fetching social feed algorithm:', error)
      }
    }

    fetchSocialFeedAlgorithm()
    fetchDislikeText();
    fetchCommentTitles();
    fetchPromptData();
    fetchNegativeKeywords();
    fetchFirebaseUserData();
    fetchUsers();
  }, []);

  const handleOptionSelect = (option: string) => {
    setCurrentModal(option);
    setIsModalOpen(true);
    if (option === "Add Free Subscription User") {
      setSelectedUsers([]); // Reset selected users when opening the modal
    }
  }

  const options = [
    "Mange Social Feed Algorithm",
    "Add Negative Keywords",
    "Add Comment Titles",
    "Add Dislike Text",
    "Add Free Subscription User",
    "System Prompt",
    "Remix Prompt",
    "Update Testing And User Value"
  ]

  const addKeyword = () => {
    if (currentKeyword && !negativeKeywords.some(k => k.negativeKeyword === currentKeyword)) {
      setNegativeKeywords([...negativeKeywords, { negativeKeyword: currentKeyword }])
      setCurrentKeyword('')
    }
  }

  const removeKeyword = async (index: number) => {
    const keywordToRemove = negativeKeywords[index];
    if (keywordToRemove._id) {
      // Make API call to delete the keyword from the database
      try {
        const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/deleteNegativeKeywords/${keywordToRemove._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error deleting negative keyword:", errorData.message || errorData);
          return;
        } else {
          console.log("Negative keyword deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting negative keyword:", error);
        return;
      }
    }

    // Remove the keyword from state
    setNegativeKeywords(prevKeywords => prevKeywords.filter((_, i) => i !== index));
  }

  const handleSave = async () => {
    switch (currentModal) {
      case "Add Negative Keywords":
        try {
          const updatedModels = negativeKeywords.map(keywordObj => ({
            _id: keywordObj._id,
            modelId: keywordObj.negativeKeyword
          }));

          const response = await fetch('https://dashboard.flashailens.com/api/dashboard/addNegativeKeywords', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ models: updatedModels }),
          });

          if (response.ok) {
            console.log("Negative keywords updated successfully");
            const data: NegativeKeywordAPIResponse = await response.json();
            setNegativeKeywords(data.data.map(item => ({
              _id: item._id,
              negativeKeyword: item.negativeKeyword
            })));
          } else {
            const errorData = await response.json();
            console.error("Error updating negative keywords:", errorData.message || errorData);
          }
        } catch (error) {
          console.error("Error updating negative keywords:", error);
        }
        break;
      case "System Prompt":
        try {
          const response = await fetch('https://dashboard.flashailens.com/api/dashboard/updatePromptValue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ generalSystemPrompt: systemPrompt }),
          });
  
          if (response.ok) {
            console.log("System prompt updated successfully");
          } else {
            const errorData = await response.json();
            console.error("Error updating system prompt:", errorData.message || errorData);
          }
        } catch (error) {
          console.error("Error updating system prompt:", error);
        }
        break;
      case "Remix Prompt":
        try {
          const response = await fetch('https://dashboard.flashailens.com/api/dashboard/updatePromptValue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: remixPrompt,
              systemPrompt: remixSystemPrompt,
            }),
          });
      
          if (response.ok) {
            console.log("Remix prompts updated successfully");
          } else {
            const errorData = await response.json();
            console.error("Error updating remix prompts:", errorData.message || errorData);
          }
        } catch (error) {
          console.error("Error updating remix prompts:", error); 
        }
        break;
      case "Add Comment Titles":
        try {
          const response = await fetch('https://dashboard.flashailens.com/api/dashboard/updateCommentTitles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creatorTitle, viewerTitle }),
          });

          if (response.ok) {
            console.log("Comment titles updated successfully");
          } else {
            const errorData = await response.json();
            console.error("Error updating comment titles:", errorData.message || errorData);
          }
        } catch (error) {
          console.error("Error updating comment titles:", error);
        }
        break;
      case "Add Dislike Text":
        try {
          await axios.post('https://dashboard.flashailens.com/api/dashboard/addDislikeText', {
            models: [{
              title: dislikeText.title,
              description: dislikeText.description,
              options: dislikeText.options
            }]
          })
          console.log("Dislike text updated successfully")
          // Refresh the dislike text data
          const response = await axios.get('https://dashboard.flashailens.com/api/dashboard/getDislikeTexts')
          setDislikeText(response.data.data)
        } catch (error) {
          console.error('Error updating dislike text:', error)
        }
        break;
      case "Update Testing And User Value":
        try {
          const response = await fetch('https://dashboard.flashailens.com/api/dashboard/updateFirebaseUserValue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testingValues),
          });

          if (response.ok) {
            console.log("Testing values updated successfully");
          } else {
            const errorData = await response.json();
            console.error("Error updating testing values:", errorData.message || errorData);
          }
        } catch (error) {
          console.error("Error while updating testing values:", error);
        }
        break;

        case "Mange Social Feed Algorithm":
        try {
          const response = await axios.post('https://dashboard.flashailens.com/api/dashboard/updateSocialAlgorithmData', socialFeedAlgorithm)
          console.log(socialFeedAlgorithm);
          if (response.status === 200) {
            console.log("Social Feed Algorithm updated successfully")
          } else {
            console.error("Error updating Social Feed Algorithm:", response.data)
          }
        } catch (error) {
          console.error("Error updating Social Feed Algorithm:", error)
        }
        break
    }
    onSelect(currentModal || "");
    setIsModalOpen(false);
  };

  const AddDislikeText = () => {
    const [newOption, setNewOption] = useState('')

    const handleAddOption = () => {
      if (newOption.trim()) {
        setDislikeText(prev => ({
          ...prev,
          options: [...prev.options, newOption.trim()]
        }))
        setNewOption('')
      }
    }

    const handleRemoveOption = async (index: number) => {
      const optionToRemove = dislikeText.options[index];
      
      try {
        await axios.post(
          'https://dashboard.flashailens.com/api/dashboard/deleteDislikeText',optionToRemove 
        );
        // Update the state after successful deletion
        setDislikeText((prev) => ({
          ...prev,
          options: prev.options.filter((_, i) => i !== index),
        }));
      } catch (error) {
        console.error('Error deleting dislike text option:', error);
      }
    };


    return (
      <div className='grid gap-4'>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={dislikeText.title}
            onChange={(e) => setDislikeText(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter title"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={dislikeText.description}
            onChange={(e) => setDislikeText(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter description"
          />
        </div>
        <div>
          <Label>Options</Label>
          {dislikeText.options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <Input 
                value={option} 
                onChange={(e) => {
                  const newOptions = [...dislikeText.options]
                  newOptions[index] = e.target.value
                  setDislikeText(prev => ({ ...prev, options: newOptions }))
                }}
                className="flex-grow" />
              <Button onClick={() => handleRemoveOption(index)} variant="destructive" size="sm" className="ml-2">
                Remove
              </Button>
            </div>
          ))}
          <div className="flex items-center mt-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="New option"
              className="flex-grow"
            />
            <Button disabled={!newOption.trim()}onClick={handleAddOption} className="ml-2">
              Add Option
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const SocialFeedAlgorithmModal = () => (
    <div className="grid gap-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Social Feed Ratio</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latestPost">Latest Post</Label>
            <Input
              id="latestPost"
              type="number"
              value={socialFeedAlgorithm.latestPost}
              onChange={(e) => setSocialFeedAlgorithm(prev => ({ ...prev, latestPost: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="highScorePost">High Score Post</Label>
            <Input
              id="highScorePost"
              type="number"
              value={socialFeedAlgorithm.highScorePost}
              onChange={(e) => setSocialFeedAlgorithm(prev => ({ ...prev, highScorePost: parseInt(e.target.value) }))}
            />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Score For Post</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="likeScore">Like Score</Label>
            <Input
              id="likeScore"
              type="number"
              value={socialFeedAlgorithm.likeScore}
              onChange={(e) => setSocialFeedAlgorithm(prev => ({ ...prev, likeScore: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="dislikeScore">Dislike Score</Label>
            <Input
              id="dislikeScore"
              type="number"
              value={socialFeedAlgorithm.dislikeScore}
              onChange={(e) => setSocialFeedAlgorithm(prev => ({ ...prev, dislikeScore: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="commentScore">Comment Score</Label>
            <Input
              id="commentScore"
              type="number"
              value={socialFeedAlgorithm.commentScore}
              onChange={(e) => setSocialFeedAlgorithm(prev => ({ ...prev, commentScore: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="reGenScore">ReGen Score</Label>
            <Input
              id="reGenScore"
              type="number"
              value={socialFeedAlgorithm.reGenScore}
              onChange={(e) => setSocialFeedAlgorithm(prev => ({ ...prev, reGenScore: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="remixScore">Remix Score</Label>
            <Input
              id="remixScore"
              type="number"
              value={socialFeedAlgorithm.remixScore}
              onChange={(e) => setSocialFeedAlgorithm(prev => ({ ...prev, remixScore: parseInt(e.target.value) }))}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const handleTestingValueChange = (key: string, value: string) => {
    setTestingValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateKeyword = (index: number, newValue: string) => {
    setNegativeKeywords((prevKeywords) => {
      const newKeywords = [...prevKeywords];
      newKeywords[index] = { ...newKeywords[index], negativeKeyword: newValue };
      return newKeywords;
    });
  };

  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Model
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map((option) => (
            <DropdownMenuItem key={option} onSelect={() => handleOptionSelect(option)}>
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="login-popup sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] w-full">
          <DialogHeader>
            <DialogTitle>{currentModal}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[63vh] overflow-y-auto p-4 mobile-pad-less">
            {currentModal === "Add Negative Keywords" && (
              <NegativeKeywordsModal
                negativeKeywords={negativeKeywords}
                currentKeyword={currentKeyword}
                setCurrentKeyword={setCurrentKeyword}
                addKeyword={addKeyword}
                removeKeyword={removeKeyword}
                updateKeyword={updateKeyword}
              />
            )}
            {currentModal === "System Prompt" && (
              <SystemPromptModal
                systemPrompt={systemPrompt}
                setSystemPrompt={setSystemPrompt}
              />
            )}
            {currentModal === "Remix Prompt" && (
              <RemixPromptModal
                remixPrompt={remixPrompt}
                setRemixPrompt={setRemixPrompt}
                remixSystemPrompt={remixSystemPrompt}
                setRemixSystemPrompt={setRemixSystemPrompt}
              />
            )}
            {currentModal === "Update Testing And User Value" && (
              <TestingValuesModal
                testingValues={testingValues}
                handleTestingValueChange={handleTestingValueChange}
              />
            )}

            {currentModal === "Add Free Subscription User" && (
              <AddFreeSubscriptionUserModal
                users={users}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />
            )}
            {currentModal === "Add Comment Titles" && (
              <AddModelCommentModal
                creatorTitle={creatorTitle}
                setCreatorTitle={setCreatorTitle}
                viewerTitle={viewerTitle}
                setViewerTitle={setViewerTitle}
              />
            )}
            {currentModal === "Add Dislike Text" && <AddDislikeText />}
            {currentModal === "Mange Social Feed Algorithm" && <SocialFeedAlgorithmModal />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className='mb-01' onClick={handleSave}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
