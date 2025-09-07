
/* eslint-disable */

  
    export type userInp = {
      avatar?: number | fileInp
national_card?: number | fileInp
      uploadedAssets?: number | fileInp
articles?: number | articleInp
edited_articles?: number | articleInp
liked_articles?: number | articleInp
bookmarked_articles?: number | articleInp
taught_courses?: number | courseInp
enrolled_courses?: number | courseInp
created_courses?: number | courseInp
    }


    export type userSchema = {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
avatar?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
national_card?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
uploadedAssets: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
}[];
articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
edited_articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
liked_articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
bookmarked_articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
taught_courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
enrolled_courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
created_courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type fileInp = {
      uploader?: number | userInp
      
    }


    export type fileSchema = {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
uploader: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type tagInp = {
      registrer?: number | userInp
      articles?: number | articleInp
courses?: number | courseInp
    }


    export type tagSchema = {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
registrer?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type categoryInp = {
      registrer?: number | userInp
      articles?: number | articleInp
courses?: number | courseInp
    }


    export type categorySchema = {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
registrer?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type courseInp = {
      featured_image?: number | fileInp
gallery?: number | fileInp
category?: number | categoryInp
tags?: number | tagInp
instructor?: number | userInp
enrolled_users?: number | userInp
creator?: number | userInp
related_courses?: number | courseInp
prerequisite_courses?: number | courseInp
      
    }


    export type courseSchema = {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
featured_image?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
gallery?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
}[];
category?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
};
tags?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
}[];
instructor?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
enrolled_users?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
}[];
creator?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
related_courses?: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
prerequisite_courses?: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type articleInp = {
      featured_image?: number | fileInp
gallery?: number | fileInp
social_image?: number | fileInp
category?: number | categoryInp
tags?: number | tagInp
author?: number | userInp
editors?: number | userInp
liked_by?: number | userInp
bookmarked_by?: number | userInp
related_articles?: number | articleInp
related_courses?: number | courseInp
referenced_files?: number | fileInp
      
    }


    export type articleSchema = {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
featured_image?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
gallery?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
}[];
social_image?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
category?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
};
tags?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
}[];
author: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
editors?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
}[];
liked_by?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
}[];
bookmarked_by?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
}[];
related_articles?: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
related_courses?: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
referenced_files?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type walletInp = {
      user?: number | userInp
      
    }


    export type walletSchema = {
_id?: string;
balance: number;
currency: ("IRR" | "USD" | "EUR" );
status: ("active" | "suspended" | "blocked" );
is_active: boolean;
last_transaction_at?: string;
createdAt: Date;
updatedAt: Date;
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type wallet_transactionInp = {
      wallet?: number | walletInp
user?: number | userInp
order?: number | orderInp
      
    }


    export type wallet_transactionSchema = {
_id?: string;
transaction_id: string;
amount: number;
currency: string;
type: ("deposit" | "withdrawal" | "purchase" | "refund" | "transfer_in" | "transfer_out" | "bonus" | "penalty" | "commission" );
status: ("pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" );
payment_method?: ("zarinpal" | "bank_transfer" | "manual" | "wallet_balance" | "credit_card" | "other" );
description?: string;
reference_id?: string;
gateway_response?: string;
balance_before: number;
balance_after: number;
ip_address?: string;
user_agent?: string;
admin_notes?: string;
processed_by?: string;
processed_at?: string;
expires_at?: string;
createdAt: Date;
updatedAt: Date;
wallet: {
_id?: string;
balance: number;
currency: ("IRR" | "USD" | "EUR" );
status: ("active" | "suspended" | "blocked" );
is_active: boolean;
last_transaction_at?: string;
createdAt: Date;
updatedAt: Date;
};
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
order?: {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type orderInp = {
      user?: number | userInp
wallet_transactions?: number | wallet_transactionInp
      
    }


    export type orderSchema = {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
wallet_transactions?: {
_id?: string;
transaction_id: string;
amount: number;
currency: string;
type: ("deposit" | "withdrawal" | "purchase" | "refund" | "transfer_in" | "transfer_out" | "bonus" | "penalty" | "commission" );
status: ("pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" );
payment_method?: ("zarinpal" | "bank_transfer" | "manual" | "wallet_balance" | "credit_card" | "other" );
description?: string;
reference_id?: string;
gateway_response?: string;
balance_before: number;
balance_after: number;
ip_address?: string;
user_agent?: string;
admin_notes?: string;
processed_by?: string;
processed_at?: string;
expires_at?: string;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type productInp = {
      category_rel?: number | categoryInp
tags_rel?: number | tagInp
created_by_user?: number | userInp
updated_by_user?: number | userInp
      
    }


    export type productSchema = {
_id?: string;
title: string;
title_en?: string;
slug: string;
description: string;
description_en?: string;
type: ("book" | "artwork" | "article" | "cultural" | "other" );
category: ("books" | "digital_books" | "physical_books" | "artworks" | "paintings" | "sculptures" | "digital_art" | "articles" | "cultural_items" | "handicrafts" | "educational" | "research" | "other" );
status: ("active" | "draft" | "archived" | "out_of_stock" );
price: number;
discounted_price?: number;
stock_quantity?: number;
is_digital: boolean;
featured_image?: {
url: string;
alt?: string;
width?: number;
height?: number;
};
gallery?: {
url: string;
alt?: string;
width?: number;
height?: number;
}[];
tags: string[];
specifications?: string;
author?: string;
author_en?: string;
isbn?: string;
publisher?: string;
publisher_en?: string;
publication_date?: Date;
language: ("fa" | "en" | "ar" | "mixed" );
page_count?: number;
file_url?: string;
file_size?: number;
file_format?: ("pdf" | "epub" | "mobi" | "jpg" | "png" | "svg" | "mp4" | "mp3" | "zip" | "rar" );
dimensions?: {
width: number;
height: number;
depth?: number;
unit: ("cm" | "mm" | "inch" );
};
weight?: {
value: number;
unit: ("g" | "kg" | "lb" );
};
materials?: string[];
artist?: string;
artist_en?: string;
artwork_year?: number;
artwork_style?: string;
is_featured: boolean;
is_bestseller: boolean;
is_new: boolean;
view_count: number;
purchase_count: number;
rating: {
average: number;
count: number;
};
meta_title?: string;
meta_description?: string;
seo_keywords?: string[];
created_by?: string;
updated_by?: string;
createdAt: Date;
updatedAt: Date;
category_rel?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
};
tags_rel?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
}[];
created_by_user?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
updated_by_user?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type ReqType = {

  
        main: {

      
        }

      
    };

  
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const lesanApi = (
	{ URL, settings, baseHeaders }: {
		URL: string;
		settings?: Record<string, any>;
		baseHeaders?: Record<string, any>;
	},
) => {
	const setting = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...baseHeaders,
		},
		...settings,
	};

	const setHeaders = (headers: Record<string, any>) => {
		setting.headers = {
			...setting.headers,
			...headers,
		};
	};

	const getSetting = () => setting;

	const send = async <
		TService extends keyof ReqType,
		TModel extends keyof ReqType[TService],
		TAct extends keyof ReqType[TService][TModel],
    // @ts-ignore: Unreachable code error
		TSet extends DeepPartial<ReqType[TService][TModel][TAct]["set"]>,
    // @ts-ignore: Unreachable code error
		TGet extends DeepPartial<ReqType[TService][TModel][TAct]["get"]>,
	>(body: {
		service?: TService;
		model: TModel;
		act: TAct;
		details: {
			set: TSet;
			get: TGet;
		};
	}, additionalHeaders?: Record<string, any>) => {
		const req = await fetch(URL, {
			...getSetting(),
			headers: {
				...getSetting().headers,
				...additionalHeaders,
		    connection: "keep-alive",
			},
			body: JSON.stringify(body),
		});

		return await req.json();
	};

	return { send, setHeaders };
};

  